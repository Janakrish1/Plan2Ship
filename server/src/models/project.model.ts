export interface Stage1Analysis {
  productIdeas: string[];
  marketSizing: Record<string, unknown>;
  customerSegments: string[];
  businessGoals: string[];
  scenarios: string[];
  customerNeeds: string[];
  competitiveInsights: string;
}

/** Stage 2: Requirements & Development — epics, user stories, AC, backlog */
export interface Stage2Analysis {
  epics?: { name: string; description: string }[];
  userStories?: { story: string; epic: string; priority: string; effort: string; dependencies?: string }[];
  acceptanceCriteria?: { storyRef: string; criteria: string[] }[];
  mvpVsLater?: { mvp: string[]; later: string[] };
  assumptions?: string[];
  raw?: string;
}

/** Stage 3: Customer & Market Research */
export interface Stage3Analysis {
  feedbackThemes?: { theme: string; evidence: string; impact: string; opportunity: string }[];
  competitorComparison?: { competitor: string; strength: string; weakness: string; gapWeExploit: string }[];
  trends?: { trend: string; implication: string }[];
  insights?: string[];
  opportunities?: string[];
  risks?: string[];
  nextResearchSteps?: string[];
  assumptions?: string[];
  raw?: string;
}

/** Stage 4: Prototyping & Testing */
export interface Stage4Analysis {
  userFlow?: { entryPoints?: string[]; steps?: string[]; description?: string };
  wireframes?: { screenName: string; purpose: string; components: string[]; microcopy: string[] }[];
  usabilityTestScript?: string | { task: string; script: string }[];
  testCases?: { case: string; steps: string; expectedResult: string; priority: string }[];
  iteration?: { feedback: string; change: string }[];
  assumptions?: string[];
  raw?: string;
}

/** Stage 5: Go-to-Market Execution */
export interface Stage5Analysis {
  personas?: { type: string; name?: string; goals?: string[]; pains?: string[]; triggers?: string[]; objections?: string[]; keyMessage?: string }[];
  messaging?: { positioningStatement?: string; benefits?: string[]; proofPoints?: string[]; taglines?: string[] };
  gtmPlan?: Record<string, unknown>;
  releaseNotes?: { customerFacing?: string; internal?: string };
  stakeholderComms?: { execs?: string; engineering?: string; support?: string };
  metrics?: { week1?: string[]; month1?: string[] };
  assumptions?: string[];
  raw?: string;
}

export interface Project {
  id: string;
  title: string;
  createdAt: string;
  currentStage: number;
  pdfPath?: string;
  rawDocument?: string;
  summary?: string;
  stage1Analysis?: Stage1Analysis;
  stage2Analysis?: Stage2Analysis;
  stage3Analysis?: Stage3Analysis;
  stage4Analysis?: Stage4Analysis;
  stage5Analysis?: Stage5Analysis;
  thumbnail?: string;
}

export interface AnalysisResult {
  projectTitle: string;
  stage1Analysis: Stage1Analysis;
  rawDocument: string;
  summary: string;
}

export interface StageOptions {
  targetPlatform?: string;
  timeline?: string;
  constraints?: string;
  customerFeedback?: string;
  competitors?: string;
  keyFlows?: string;
  launchTiming?: string;
  targetRegions?: string;
}
