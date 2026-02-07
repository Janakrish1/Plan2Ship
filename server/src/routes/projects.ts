import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  ensureDirectories,
  saveProjectFile,
  getProjectDataPath,
  listProjectIds,
  readProjectData,
  writeProjectData,
  deleteProject,
} from '../utils/fileStorage.js';
import {
  analyzeUploadedPdf,
  brainstormForProject,
  runStageAnalysis,
} from '../services/projectAnalysis.service.js';
import type { Project, StageOptions } from '../models/project.model.js';

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
