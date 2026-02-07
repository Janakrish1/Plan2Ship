import { AzureOpenAIService } from './azureOpenAI.service.js';
import { extractTextFromPdf } from './pdfParser.service.js';
import type {
  Project,
  AnalysisResult,
  Stage2Analysis,
  Stage3Analysis,
  Stage4Analysis,
  Stage5Analysis,
  StageOptions,
} from '../models/project.model.js';

const azureOpenAI = new AzureOpenAIService();

export async function analyzeUploadedPdf(pdfBuffer: Buffer): Promise<AnalysisResult> {
  const text = await extractTextFromPdf(pdfBuffer);
  return azureOpenAI.analyzeDocument(text);
}

export async function brainstormForProject(
  project: Project,
  stage: number,
  additionalContext?: string
): Promise<string[]> {
  const contextParts: string[] = [];
  if (project.summary) contextParts.push(project.summary);
  if (project.stage1Analysis) {
    contextParts.push(
      'Product ideas: ' + (project.stage1Analysis.productIdeas?.join(', ') ?? ''),
      'Customer segments: ' + (project.stage1Analysis.customerSegments?.join(', ') ?? ''),
      'Competitive insights: ' + (project.stage1Analysis.competitiveInsights ?? '')
    );
  }
  const projectContext = contextParts.join('\n') || project.rawDocument || project.title;
  return azureOpenAI.brainstorm(stage, projectContext, additionalContext);
}

function buildStage1Context(project: Project): string {
  const parts: string[] = [];
  if (project.summary) parts.push('Summary: ' + project.summary);
  if (project.stage1Analysis) {
    parts.push('Product ideas: ' + (project.stage1Analysis.productIdeas?.join('; ') ?? ''));
    parts.push('Customer segments: ' + (project.stage1Analysis.customerSegments?.join('; ') ?? ''));
    parts.push('Business goals: ' + (project.stage1Analysis.businessGoals?.join('; ') ?? ''));
    parts.push('Scenarios: ' + (project.stage1Analysis.scenarios?.join('; ') ?? ''));
    parts.push('Competitive insights: ' + (project.stage1Analysis.competitiveInsights ?? ''));
  }
  return parts.join('\n') || project.title || 'No prior context';
}

export async function runStageAnalysis(
  project: Project,
  stage: 2 | 3 | 4 | 5,
  options?: StageOptions
): Promise<Stage2Analysis | Stage3Analysis | Stage4Analysis | Stage5Analysis> {
  const doc = project.rawDocument || project.summary || project.title || '';
  const stage1Context = buildStage1Context(project);
  if (stage === 2) return azureOpenAI.analyzeStage2(doc, stage1Context, options);
  if (stage === 3) return azureOpenAI.analyzeStage3(doc, stage1Context, options);
  if (stage === 4) return azureOpenAI.analyzeStage4(doc, stage1Context, options);
  if (stage === 5) return azureOpenAI.analyzeStage5(doc, stage1Context, options);
  throw new Error(`Unknown stage: ${stage}`);
}
