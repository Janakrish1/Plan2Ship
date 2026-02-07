import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  ensureDirectories,
  saveProjectFile,
  saveWireframeImage,
  getWireframeImagePath,
  getProjectDataPath,
  getMetricsChartPath,
  listProjectIds,
  readProjectData,
  writeProjectData,
  deleteProject,
} from '../utils/fileStorage.js';
import { generateMetricsCharts } from '../services/metricsCharts.service.js';
import type { MetricsCharts } from '../models/project.model.js';
import {
  analyzeUploadedPdf,
  brainstormForProject,
  runStageAnalysis,
} from '../services/projectAnalysis.service.js';
import {
  generateImage,
  buildWireframePrompt,
  getRandomVariationHint,
} from '../services/imageGeneration.service.js';
import type { Project, StageOptions } from '../models/project.model.js';
import fs from 'fs/promises';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    await ensureDirectories();
    const ids = await listProjectIds();
    const projects: Project[] = [];
    for (const id of ids) {
      const raw = await readProjectData(id);
      if (raw) {
        try {
          const p = JSON.parse(raw) as Project;
          projects.push({
            id: p.id,
            title: p.title,
            createdAt: p.createdAt,
            currentStage: p.currentStage,
            thumbnail: p.thumbnail,
          });
        } catch {
          // skip invalid
        }
      }
    }
    projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(projects);
  } catch (e) {
    console.error('GET /api/projects', e);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const project = JSON.parse(raw) as Project;
    res.json(project);
  } catch (e) {
    console.error('GET /api/projects/:id', e);
    res.status(500).json({ error: 'Failed to load project' });
  }
});

router.post('/create', upload.single('document'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No PDF file uploaded' });
    return;
  }
  const projectId = uuidv4();
  try {
    const analysis = await analyzeUploadedPdf(req.file.buffer);
    const originalName =
      typeof req.file.originalname === 'string' && req.file.originalname
        ? req.file.originalname
        : 'document.pdf';
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    await saveProjectFile(projectId, safeName, req.file.buffer);

    const project: Project = {
      id: projectId,
      title: analysis.projectTitle,
      createdAt: new Date().toISOString(),
      currentStage: 1,
      pdfPath: `uploads/${projectId}/${safeName}`,
      rawDocument: analysis.rawDocument,
      summary: analysis.summary,
      stage1Analysis: analysis.stage1Analysis,
    };
    await writeProjectData(projectId, JSON.stringify(project, null, 2));
    try {
      const generated = await generateMetricsCharts(projectId, 1);
      if (generated.length) {
        project.metricsCharts = { ...project.metricsCharts, stage1: generated };
        await writeProjectData(projectId, JSON.stringify(project, null, 2));
      }
    } catch (chartErr) {
      console.warn('Stage 1 metrics charts skipped:', chartErr);
    }
    res.status(201).json({ id: projectId, project });
  } catch (e) {
    console.error('POST /api/projects/create', e);
    const message = e instanceof Error ? e.message : 'Document processing failed';
    res.status(500).json({ error: message });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const project = JSON.parse(raw) as Project;
    if (typeof req.body.title === 'string' && req.body.title.trim()) {
      project.title = req.body.title.trim();
    }
    if (req.body.stage1Analysis && typeof req.body.stage1Analysis === 'object') {
      project.stage1Analysis = req.body.stage1Analysis;
    }
    if (typeof req.body.currentStage === 'number' && req.body.currentStage >= 1 && req.body.currentStage <= 5) {
      project.currentStage = req.body.currentStage;
    }
    await writeProjectData(id, JSON.stringify(project, null, 2));
    res.json(project);
  } catch (e) {
    console.error('PATCH /api/projects/:id', e);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.post('/:id/analyze-stage', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const project = JSON.parse(raw) as Project;
    const stage = Number(req.body?.stage);
    if (![2, 3, 4, 5].includes(stage)) {
      res.status(400).json({ error: 'stage must be 2, 3, 4, or 5' });
      return;
    }
    const options = req.body?.options as StageOptions | undefined;
    const analysis = await runStageAnalysis(project, stage as 2 | 3 | 4 | 5, options);
    if (stage === 2) project.stage2Analysis = analysis;
    else if (stage === 3) project.stage3Analysis = analysis;
    else if (stage === 4) project.stage4Analysis = analysis;
    else project.stage5Analysis = analysis;
    project.currentStage = Math.max(project.currentStage, stage);
    await writeProjectData(id, JSON.stringify(project, null, 2));
    if ([2, 3, 5].includes(stage)) {
      try {
        const generated = await generateMetricsCharts(id, stage as 2 | 3 | 5);
        if (generated.length) {
          const key = stage === 2 ? 'stage2' : stage === 3 ? 'stage3' : 'stage5';
          project.metricsCharts = { ...project.metricsCharts, [key]: generated } as MetricsCharts;
          await writeProjectData(id, JSON.stringify(project, null, 2));
        }
      } catch (chartErr) {
        console.warn(`Stage ${stage} metrics charts skipped:`, chartErr);
      }
    }
    res.json(project);
  } catch (e) {
    console.error('POST /api/projects/:id/analyze-stage', e);
    const message = e instanceof Error ? e.message : 'Stage analysis failed';
    res.status(500).json({ error: message });
  }
});

router.post('/:id/brainstorm', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const project = JSON.parse(raw) as Project;
    const stage = Number(req.body?.stage) || 1;
    const additionalContext =
      typeof req.body?.additionalContext === 'string' ? req.body.additionalContext : undefined;
    const insights = await brainstormForProject(project, stage, additionalContext);
    if (project.stage1Analysis?.productIdeas) {
      project.stage1Analysis.productIdeas = [
        ...project.stage1Analysis.productIdeas,
        ...insights,
      ];
    } else if (project.stage1Analysis) {
      project.stage1Analysis.productIdeas = insights;
    }
    await writeProjectData(id, JSON.stringify(project, null, 2));
    res.json({ insights, updatedProject: project });
  } catch (e) {
    console.error('POST /api/projects/:id/brainstorm', e);
    const message = e instanceof Error ? e.message : 'Brainstorm failed';
    res.status(500).json({ error: message });
  }
});

router.post('/:id/wireframe-image', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const project = JSON.parse(raw) as Project;
    const wireframeIndex = Number(req.body?.wireframeIndex);
    const wireframes = project.stage4Analysis?.wireframes;
    if (
      !Array.isArray(wireframes) ||
      wireframeIndex < 0 ||
      wireframeIndex >= wireframes.length
    ) {
      res.status(400).json({ error: 'Invalid wireframeIndex or no wireframes' });
      return;
    }
    const wireframe = wireframes[wireframeIndex];
    const variationHint =
      typeof req.body?.variation === 'string'
        ? req.body.variation
        : getRandomVariationHint();
    const prompt = buildWireframePrompt(
      {
        screenName: wireframe.screenName,
        purpose: wireframe.purpose,
        components: wireframe.components ?? [],
        microcopy: wireframe.microcopy ?? [],
      },
      variationHint
    );
    const imageBuffer = await generateImage(prompt);
    const relativePath = await saveWireframeImage(id, wireframeIndex, imageBuffer);
    wireframe.imagePath = relativePath;
    await writeProjectData(id, JSON.stringify(project, null, 2));
    res.json({ imagePath: relativePath, project });
  } catch (e) {
    console.error('POST /api/projects/:id/wireframe-image', e);
    const message = e instanceof Error ? e.message : 'Wireframe image generation failed';
    res.status(500).json({ error: message });
  }
});

router.get('/:id/wireframe-image/:filename', async (req: Request, res: Response) => {
  try {
    const { id, filename } = req.params;
    if (!/^screen-\d+(-\d+)?\.png$/.test(filename)) {
      res.status(400).send('Invalid filename');
      return;
    }
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).send('Project not found');
      return;
    }
    const fullPath = getWireframeImagePath(id, `wireframes/${filename}`);
    const buffer = await fs.readFile(fullPath);
    res.set({ 'Cache-Control': 'public, max-age=86400' });
    res.contentType('image/png').send(buffer);
  } catch {
    res.status(404).send('Not found');
  }
});

router.get('/:id/metrics-chart/:filename', async (req: Request, res: Response) => {
  try {
    const { id, filename } = req.params;
    if (!/^stage[1235]-[a-z0-9-]+\.png$/.test(filename)) {
      res.status(400).send('Invalid filename');
      return;
    }
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).send('Project not found');
      return;
    }
    const fullPath = getMetricsChartPath(id, filename);
    const buffer = await fs.readFile(fullPath);
    res.set({ 'Cache-Control': 'public, max-age=86400' });
    res.contentType('image/png').send(buffer);
  } catch {
    res.status(404).send('Not found');
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await readProjectData(id);
    if (!raw) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    await deleteProject(id);
    res.status(204).send();
  } catch (e) {
    console.error('DELETE /api/projects/:id', e);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
