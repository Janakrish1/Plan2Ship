import type { Stage3Analysis as Stage3Type, MetricsCharts } from '../types/project';
import { StageSection } from './StageSection';
import { getMetricsChartUrl } from '../services/api';

interface Stage3AnalysisProps {
  data: Stage3Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  metricsCharts?: MetricsCharts;
}

export function Stage3Analysis({ data, onGenerate, isGenerating, projectId, metricsCharts }: Stage3AnalysisProps) {
  if (!data) {
    return (
      <StageSection stageNumber={3} title="Customer & Market Research">
        <p className="text-muted-foreground text-sm mb-4">
          Feedback themes, competitor comparison, trends, and actionable insights.
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate Stage 3'}
        </button>
      </StageSection>
    );
  }

  return (
    <StageSection stageNumber={3} title="Customer & Market Research" defaultOpen>
      <div className="space-y-6">
        {data.feedbackThemes?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Feedback Themes</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-white/10">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-3 py-2 text-left font-medium text-foreground">Theme</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Evidence</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Impact</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.feedbackThemes.map((f, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-3 py-2">{f.theme}</td>
                      <td className="px-3 py-2 text-muted-foreground">{f.evidence}</td>
                      <td className="px-3 py-2 text-muted-foreground">{f.impact}</td>
                      <td className="px-3 py-2 text-muted-foreground">{f.opportunity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        {data.competitorComparison?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Competitor Comparison</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-white/10">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-3 py-2 text-left font-medium text-foreground">Competitor</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Strength</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Weakness</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Gap we exploit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.competitorComparison.map((c, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-3 py-2">{c.competitor}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.strength}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.weakness}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.gapWeExploit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        {data.trends?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Industry Trends</h4>
            <ul className="space-y-2">
              {data.trends.map((t, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground">{t.trend}</span>
                  <span className="text-muted-foreground"> — {t.implication}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {(data.insights?.length || data.opportunities?.length || data.risks?.length) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.insights?.length ? (
              <div>
                <h4 className="font-medium text-foreground mb-2">Top Insights</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm">
                  {data.insights.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.opportunities?.length ? (
              <div>
                <h4 className="font-medium text-foreground mb-2">Opportunities</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm">
                  {data.opportunities.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.risks?.length ? (
              <div>
                <h4 className="font-medium text-foreground mb-2">Risks</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm">
                  {data.risks.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
        {data.nextResearchSteps?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Next Research Steps</h4>
            <ul className="list-disc list-inside text-muted-foreground text-sm">
              {data.nextResearchSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {projectId && metricsCharts?.stage3?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Market research metrics</h4>
            <p className="text-muted-foreground text-sm mb-3">Feedback themes, competitor comparison, and industry trends.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metricsCharts.stage3.map((filename) => (
                <figure key={filename} className="rounded-lg border border-white/10 overflow-hidden bg-card/40">
                  <img
                    src={getMetricsChartUrl(projectId, filename)}
                    alt={filename.replace('.png', '').replace(/-/g, ' ')}
                    className="w-full h-auto"
                  />
                </figure>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
