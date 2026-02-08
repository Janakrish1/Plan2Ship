import type { Stage3Analysis as Stage3Type, MetricsCharts } from '../types/project';
import { StageSection } from './StageSection';
import { MetricsChartFigure } from './MetricsChartFigure';
import { DataTable } from './ui/data-table';
import { SectionHeading, KeyValueCard, AccentCard } from './content-blocks';
import { MessageSquare, Swords, TrendingUp, BarChart2 } from 'lucide-react';

interface Stage3AnalysisProps {
  data: Stage3Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  metricsCharts?: MetricsCharts;
  sectionId?: string;
}

export function Stage3Analysis({ data, onGenerate, isGenerating, projectId, metricsCharts, sectionId }: Stage3AnalysisProps) {
  if (!data) {
    return (
      <StageSection id={sectionId} stageNumber={3} title="Customer & Market Research">
        <p className="text-muted-foreground text-sm mb-3">
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
    <StageSection id={sectionId} stageNumber={3} title="Customer & Market Research" defaultOpen>
      <div className="space-y-5">
        {data.feedbackThemes?.length ? (
          <div>
            <SectionHeading title="Feedback Themes" icon={MessageSquare} description="Voice of customer" />
            <DataTable
              columns={[
                { key: 'theme', label: 'Theme', highlight: true },
                { key: 'evidence', label: 'Evidence' },
                { key: 'impact', label: 'Impact' },
                { key: 'opportunity', label: 'Opportunity' },
              ]}
              rows={data.feedbackThemes.map((f) => ({
                theme: f.theme,
                evidence: f.evidence,
                impact: f.impact,
                opportunity: f.opportunity,
              }))}
            />
          </div>
        ) : null}
        {data.competitorComparison?.length ? (
          <div>
            <SectionHeading title="Competitor Comparison" icon={Swords} description="Strengths, gaps, opportunities" />
            <DataTable
              columns={[
                { key: 'competitor', label: 'Competitor', highlight: true },
                { key: 'strength', label: 'Strength' },
                { key: 'weakness', label: 'Weakness' },
                { key: 'gapWeExploit', label: 'Gap we exploit' },
              ]}
              rows={data.competitorComparison.map((c) => ({
                competitor: c.competitor,
                strength: c.strength,
                weakness: c.weakness,
                gapWeExploit: c.gapWeExploit,
              }))}
            />
          </div>
        ) : null}
        {data.trends?.length ? (
          <div>
            <SectionHeading title="Industry Trends" icon={TrendingUp} />
            <div className="space-y-2">
              {data.trends.map((t, i) => (
                <AccentCard key={i} title={t.trend} accentColor="primary">
                  {t.implication}
                </AccentCard>
              ))}
            </div>
          </div>
        ) : null}
        {(data.insights?.length || data.opportunities?.length || data.risks?.length) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.insights?.length ? (
              <KeyValueCard title="Top Insights" items={data.insights} variant="primary" />
            ) : null}
            {data.opportunities?.length ? (
              <KeyValueCard title="Opportunities" items={data.opportunities} variant="default" />
            ) : null}
            {data.risks?.length ? (
              <KeyValueCard title="Risks" items={data.risks} variant="muted" />
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
            <SectionHeading title="Market research metrics" icon={BarChart2} description="Feedback themes, competitor comparison, and industry trends." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {metricsCharts.stage3.map((filename) => (
                <MetricsChartFigure key={filename} projectId={projectId} filename={filename} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
