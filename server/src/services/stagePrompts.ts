import type { StageOptions } from '../models/project.model.js';

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '\n...[truncated]';
}

const DOC_PLACEHOLDER = '{DOCUMENT}';
const STAGE1_CONTEXT_PLACEHOLDER = '{STAGE1_CONTEXT}';
const OPTIONS_PLACEHOLDER = '{OPTIONS}';

export function getStage2Prompt(doc: string, stage1Context: string, options?: StageOptions): { system: string; user: string } {
  const system = `You are a Product Manager + Business Analyst. Do ONLY Requirements & Development: epics, user stories, acceptance criteria, backlog grooming. Do NOT do market research, personas, GTM, wireframes, or launch plans. Return ONLY valid JSON, no markdown fences.`;

  const opts = [
    options?.targetPlatform ? `Target platform: ${options.targetPlatform}` : '',
    options?.timeline ? `MVP timeline: ${options.timeline}` : '',
    options?.constraints ? `Constraints: ${options.constraints}` : '',
  ].filter(Boolean).join('\n');

  const user = `INPUT:
Project Document (summary):
${truncate(doc, 25000)}

Prior stage (Strategy) context:
${truncate(stage1Context, 8000)}
${opts ? '\n' + opts : ''}

TASKS: 1) Create 4–7 Epics (name + 1–2 line description). 2) Write 12–20 User Stories: "As a <user>, I want <capability>, so that <benefit>." 3) For EACH story write Acceptance Criteria in Gherkin (Given/When/Then), include at least 1 edge case. 4) Backlog: priority (P0/P1/P2), effort (S/M/L), dependencies, MVP slice vs Later.

Return JSON only with this structure:
{
  "epics": [{"name":"","description":""}],
  "userStories": [{"story":"As a...","epic":"Epic name","priority":"P0|P1|P2","effort":"S|M|L","dependencies":""}],
  "acceptanceCriteria": [{"storyRef":"story text or id","criteria":["Given... When... Then..."]}],
  "mvpVsLater": {"mvp":[""],"later":[""]},
  "assumptions": ["max 6"]
}`;

  return { system, user };
}

export function getStage3Prompt(doc: string, stage1Context: string, options?: StageOptions): { system: string; user: string } {
  const system = `You are a Product Researcher. Do ONLY Customer & Market Research: synthesize feedback, competitors, industry trends into actionable insights. Do NOT create user stories, AC, wireframes, or GTM. Return ONLY valid JSON, no markdown fences.`;

  const opts = [
    options?.customerFeedback ? `Customer feedback: ${options.customerFeedback}` : '',
    options?.competitors ? `Known competitors: ${options.competitors}` : '',
  ].filter(Boolean).join('\n');

  const user = `INPUT:
Project Document:
${truncate(doc, 25000)}

Strategy context:
${truncate(stage1Context, 6000)}
${opts ? '\n' + opts : ''}

TASKS: 1) Customer Feedback: generate 12–18 SYNTHETIC feedback snippets (label as synthetic), cluster into 4–6 themes. 2) Competitor scan: 6–10 competitors, compare on key capabilities. 3) Industry trends: 5–8 trends and implications. 4) Actionable: Top 5 Insights, Top 5 Opportunities, Top Risks, Next research steps (max 5).

Return JSON only:
{
  "feedbackThemes": [{"theme":"","evidence":"","impact":"","opportunity":""}],
  "competitorComparison": [{"competitor":"","strength":"","weakness":"","gapWeExploit":""}],
  "trends": [{"trend":"","implication":""}],
  "insights": [],
  "opportunities": [],
  "risks": [],
  "nextResearchSteps": [],
  "assumptions": []
}`;

  return { system, user };
}

export function getStage4Prompt(doc: string, stage1Context: string, options?: StageOptions): { system: string; user: string } {
  const system = `You are a Product Designer + UX Researcher. Do ONLY Prototyping & Testing: user flows, text wireframes, test cases, iteration from feedback. Do NOT do market research, backlog, or GTM. Return ONLY valid JSON, no markdown fences.`;

  const opts = [
    options?.targetPlatform ? `Target platform: ${options.targetPlatform}` : '',
    options?.keyFlows ? `Key flows: ${options.keyFlows}` : '',
  ].filter(Boolean).join('\n');

  const user = `INPUT:
Project Document:
${truncate(doc, 25000)}

Strategy context:
${truncate(stage1Context, 6000)}
${opts ? '\n' + opts : ''}

TASKS: 1) User Flow: entry points + step-by-step core journey. 2) Low-fi Wireframes in TEXT: for each screen give screenName, purpose, components list, microcopy (3–6 exact strings). 3) Testing: 5 usability tasks (script), 12–18 test cases with edge cases, success criteria. 4) Iteration: 6 synthetic user feedback notes and design changes you'd make.

Return JSON only:
{
  "userFlow": {"entryPoints":[],"steps":[],"description":""},
  "wireframes": [{"screenName":"","purpose":"","components":[],"microcopy":[]}],
  "usabilityTestScript": [{"task":"","script":""}],
  "testCases": [{"case":"","steps":"","expectedResult":"","priority":""}],
  "iteration": [{"feedback":"","change":""}],
  "assumptions": []
}`;

  return { system, user };
}

export function getStage5Prompt(doc: string, stage1Context: string, options?: StageOptions): { system: string; user: string } {
  const system = `You are a Product Marketing Manager + Product Lead. Do ONLY Go-to-Market: personas, messaging, GTM plan, release notes, stakeholder comms. Do NOT do research synthesis, user stories, or wireframes. Return ONLY valid JSON, no markdown fences.`;

  const opts = [
    options?.launchTiming ? `Launch timing: ${options.launchTiming}` : '',
    options?.targetRegions ? `Target regions/channels: ${options.targetRegions}` : '',
  ].filter(Boolean).join('\n');

  const user = `INPUT:
Project Document:
${truncate(doc, 25000)}

Strategy context:
${truncate(stage1Context, 6000)}
${opts ? '\n' + opts : ''}

TASKS: 1) Personas: Primary + Secondary; goals, pains, triggers, objections, key message. 2) Messaging: positioning statement, 3 benefits + 3 proof points, 5 taglines. 3) GTM Plan: launch goals, channels+tactics, rollout (beta→phased→GA), risks+mitigations. 4) Release notes: customer-facing (short), internal (support/compliance). 5) Stakeholder comms: one for execs, one for engineering/design, one for support. 6) Success metrics: Week 1 + Month 1.

Return JSON only:
{
  "personas": [{"type":"primary|secondary","name":"","goals":[],"pains":[],"triggers":[],"objections":[],"keyMessage":""}],
  "messaging": {"positioningStatement":"","benefits":[],"proofPoints":[],"taglines":[]},
  "gtmPlan": {"launchGoals":[],"channels":[],"rollout":"","risks":[]},
  "releaseNotes": {"customerFacing":"","internal":""},
  "stakeholderComms": {"execs":"","engineering":"","support":""},
  "metrics": {"week1":[],"month1":[]},
  "assumptions": []
}`;

  return { system, user };
}
