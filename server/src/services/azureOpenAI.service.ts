import OpenAI from 'openai';
import type {
  AnalysisResult,
  Stage2Analysis,
  Stage3Analysis,
  Stage4Analysis,
  Stage5Analysis,
  StageOptions,
} from '../models/project.model.js';
import {
  getStage2Prompt,
  getStage3Prompt,
  getStage4Prompt,
  getStage5Prompt,
} from './stagePrompts.js';

const ANALYSIS_SYSTEM_PROMPT = `You are a product management expert analyzing product documents for Stage 1: Product Strategy & Ideation.
Your task is to extract structured information and return ONLY valid JSON, no markdown code fences or extra text.`;

const ANALYSIS_USER_TEMPLATE = `Analyze the following product document and extract:
1. Project Title (concise, descriptive name for this product)
2. Product Strategy & Ideation Analysis including:
   - Key product ideas and concepts
   - Market sizing opportunities
   - Potential customer segments
   - Business goals alignment
   - Strategic scenarios and planning considerations
   - Customer needs identified
   - Competitive positioning insights

Document Content:
{extracted_pdf_text}

Return response in JSON format only:
{
  "projectTitle": "...",
  "stage1Analysis": {
    "productIdeas": [],
    "marketSizing": {},
    "customerSegments": [],
    "businessGoals": [],
    "scenarios": [],
    "customerNeeds": [],
    "competitiveInsights": "..."
  },
  "rawDocument": "...",
  "summary": "..."
}`;

function createClient(): OpenAI {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? '2024-12-01-preview';
  if (!endpoint || !apiKey) {
    throw new Error('AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be set');
  }
  const base = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment ?? 'gpt-4'}`;
  return new OpenAI({
    apiKey,
    baseURL: base,
    defaultQuery: { 'api-version': apiVersion },
  });
}

export class AzureOpenAIService {
  private client: OpenAI;
  private deployment: string;

  constructor() {
    this.client = createClient();
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? 'gpt-4';
  }

  async analyzeDocument(documentText: string): Promise<AnalysisResult> {
    const truncated =
      documentText.length > 120000 ? documentText.slice(0, 120000) + '\n...[truncated]' : documentText;
    const userContent = ANALYSIS_USER_TEMPLATE.replace('{extracted_pdf_text}', truncated);

    const response = await this.client.chat.completions.create({
      model: this.deployment,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_completion_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Azure OpenAI');
    }

    const cleaned = content.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned) as AnalysisResult;

    if (!parsed.projectTitle || !parsed.stage1Analysis) {
      throw new Error('Invalid analysis structure from AI');
    }

    return {
      projectTitle: parsed.projectTitle,
      stage1Analysis: {
        productIdeas: Array.isArray(parsed.stage1Analysis?.productIdeas)
          ? parsed.stage1Analysis.productIdeas
          : [],
        marketSizing:
          parsed.stage1Analysis?.marketSizing && typeof parsed.stage1Analysis.marketSizing === 'object'
            ? parsed.stage1Analysis.marketSizing
            : {},
        customerSegments: Array.isArray(parsed.stage1Analysis?.customerSegments)
          ? parsed.stage1Analysis.customerSegments
          : [],
        businessGoals: Array.isArray(parsed.stage1Analysis?.businessGoals)
          ? parsed.stage1Analysis.businessGoals
          : [],
        scenarios: Array.isArray(parsed.stage1Analysis?.scenarios)
          ? parsed.stage1Analysis.scenarios
          : [],
        customerNeeds: Array.isArray(parsed.stage1Analysis?.customerNeeds)
          ? parsed.stage1Analysis.customerNeeds
          : [],
        competitiveInsights:
          typeof parsed.stage1Analysis?.competitiveInsights === 'string'
            ? parsed.stage1Analysis.competitiveInsights
            : '',
      },
      rawDocument: typeof parsed.rawDocument === 'string' ? parsed.rawDocument : truncated,
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    };
  }

  async brainstorm(
    stage: number,
    projectContext: string,
    additionalContext?: string
  ): Promise<string[]> {
    const userContent = additionalContext
      ? `Stage ${stage} context:\n${projectContext}\n\nAdditional focus:\n${additionalContext}\n\nProvide 5-8 new actionable insights as a JSON array of strings.`
      : `Stage ${stage} context:\n${projectContext}\n\nProvide 5-8 new actionable insights as a JSON array of strings.`;

    const response = await this.client.chat.completions.create({
      model: this.deployment,
      messages: [
        {
          role: 'system',
          content:
            'You are a product management expert. Reply with ONLY a JSON array of strings, no other text.',
        },
        { role: 'user', content: userContent },
      ],
      max_completion_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty brainstorm response');

    const cleaned = content.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const arr = JSON.parse(cleaned);
    return Array.isArray(arr) ? arr.map(String) : [String(arr)];
  }

  private async runStageCompletion(system: string, user: string): Promise<Record<string, unknown>> {
    const response = await this.client.chat.completions.create({
      model: this.deployment,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_completion_tokens: 4000,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Azure OpenAI');
    const cleaned = content.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned) as Record<string, unknown>;
  }

  async analyzeStage2(
    doc: string,
    stage1Context: string,
    options?: StageOptions
  ): Promise<Stage2Analysis> {
    const { system, user } = getStage2Prompt(doc, stage1Context, options);
    const raw = await this.runStageCompletion(system, user);
    return normalizeStage2(raw);
  }

  async analyzeStage3(
    doc: string,
    stage1Context: string,
    options?: StageOptions
  ): Promise<Stage3Analysis> {
    const { system, user } = getStage3Prompt(doc, stage1Context, options);
    const raw = await this.runStageCompletion(system, user);
    return normalizeStage3(raw);
  }

  async analyzeStage4(
    doc: string,
    stage1Context: string,
    options?: StageOptions
  ): Promise<Stage4Analysis> {
    const { system, user } = getStage4Prompt(doc, stage1Context, options);
    const raw = await this.runStageCompletion(system, user);
    return normalizeStage4(raw);
  }

  async analyzeStage5(
    doc: string,
    stage1Context: string,
    options?: StageOptions
  ): Promise<Stage5Analysis> {
    const { system, user } = getStage5Prompt(doc, stage1Context, options);
    const raw = await this.runStageCompletion(system, user);
    return normalizeStage5(raw);
  }
}

function normalizeStage2(raw: Record<string, unknown>): Stage2Analysis {
  return {
    epics: Array.isArray(raw.epics) ? (raw.epics as Stage2Analysis['epics']) : undefined,
    userStories: Array.isArray(raw.userStories) ? (raw.userStories as Stage2Analysis['userStories']) : undefined,
    acceptanceCriteria: Array.isArray(raw.acceptanceCriteria) ? (raw.acceptanceCriteria as Stage2Analysis['acceptanceCriteria']) : undefined,
    mvpVsLater: raw.mvpVsLater && typeof raw.mvpVsLater === 'object' ? (raw.mvpVsLater as Stage2Analysis['mvpVsLater']) : undefined,
    assumptions: Array.isArray(raw.assumptions) ? (raw.assumptions as string[]) : undefined,
    raw: JSON.stringify(raw),
  };
}

function normalizeStage3(raw: Record<string, unknown>): Stage3Analysis {
  return {
    feedbackThemes: Array.isArray(raw.feedbackThemes) ? (raw.feedbackThemes as Stage3Analysis['feedbackThemes']) : undefined,
    competitorComparison: Array.isArray(raw.competitorComparison) ? (raw.competitorComparison as Stage3Analysis['competitorComparison']) : undefined,
    trends: Array.isArray(raw.trends) ? (raw.trends as Stage3Analysis['trends']) : undefined,
    insights: Array.isArray(raw.insights) ? (raw.insights as string[]) : undefined,
    opportunities: Array.isArray(raw.opportunities) ? (raw.opportunities as string[]) : undefined,
    risks: Array.isArray(raw.risks) ? (raw.risks as string[]) : undefined,
    nextResearchSteps: Array.isArray(raw.nextResearchSteps) ? (raw.nextResearchSteps as string[]) : undefined,
    assumptions: Array.isArray(raw.assumptions) ? (raw.assumptions as string[]) : undefined,
    raw: JSON.stringify(raw),
  };
}

function normalizeStage4(raw: Record<string, unknown>): Stage4Analysis {
  const script = raw.usabilityTestScript;
  const usabilityTestScript: Stage4Analysis['usabilityTestScript'] =
    typeof script === 'string'
      ? script
      : Array.isArray(script)
        ? (script as { task: string; script: string }[])
        : undefined;
  return {
    userFlow: raw.userFlow && typeof raw.userFlow === 'object' ? (raw.userFlow as Stage4Analysis['userFlow']) : undefined,
    wireframes: Array.isArray(raw.wireframes) ? (raw.wireframes as Stage4Analysis['wireframes']) : undefined,
    usabilityTestScript,
    testCases: Array.isArray(raw.testCases) ? (raw.testCases as Stage4Analysis['testCases']) : undefined,
    iteration: Array.isArray(raw.iteration) ? (raw.iteration as Stage4Analysis['iteration']) : undefined,
    assumptions: Array.isArray(raw.assumptions) ? (raw.assumptions as string[]) : undefined,
    raw: JSON.stringify(raw),
  };
}

function normalizeStage5(raw: Record<string, unknown>): Stage5Analysis {
  return {
    personas: Array.isArray(raw.personas) ? (raw.personas as Stage5Analysis['personas']) : undefined,
    messaging: raw.messaging && typeof raw.messaging === 'object' ? (raw.messaging as Stage5Analysis['messaging']) : undefined,
    gtmPlan: raw.gtmPlan && typeof raw.gtmPlan === 'object' ? (raw.gtmPlan as Record<string, unknown>) : undefined,
    releaseNotes: raw.releaseNotes && typeof raw.releaseNotes === 'object' ? (raw.releaseNotes as Stage5Analysis['releaseNotes']) : undefined,
    stakeholderComms: raw.stakeholderComms && typeof raw.stakeholderComms === 'object' ? (raw.stakeholderComms as Stage5Analysis['stakeholderComms']) : undefined,
    metrics: raw.metrics && typeof raw.metrics === 'object' ? (raw.metrics as Stage5Analysis['metrics']) : undefined,
    assumptions: Array.isArray(raw.assumptions) ? (raw.assumptions as string[]) : undefined,
    raw: JSON.stringify(raw),
  };
}
