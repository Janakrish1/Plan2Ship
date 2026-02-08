import type { Stage2Analysis as Stage2Type, MetricsCharts } from '../types/project';
import { StageSection } from './StageSection';
import { MetricsChartFigure } from './MetricsChartFigure';
import { SimpleDataTable } from './ui/data-table';
import { SectionHeading, KeyValueCard, AccentCard } from './content-blocks';
import { Layers, BookOpen, CheckSquare, AlertCircle, BarChart2 } from 'lucide-react';

interface Stage2AnalysisProps {
  data: Stage2Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  metricsCharts?: MetricsCharts;
  sectionId?: string;
}

export function Stage2Analysis({ data, onGenerate, isGenerating, projectId, metricsCharts, sectionId }: Stage2AnalysisProps) {
  if (!data) {
    return (
      <StageSection id={sectionId} stageNumber={2} title="Requirements & Development">
        <p className="text-muted-foreground text-sm mb-3">
          Epics, user stories, acceptance criteria, and backlog (MVP vs Later).
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate Stage 2'}
        </button>
      </StageSection>
    );
  }

  return (
    <StageSection id={sectionId} stageNumber={2} title="Requirements & Development" defaultOpen>
      <div className="space-y-5">
        {data.epics?.length ? (
          <div>
            <SectionHeading title="Epics" icon={Layers} description="High-level feature groups" />
            <div className="space-y-2">
              {data.epics.map((e, i) => (
                <AccentCard key={i} title={e.name} accentColor="primary">
                  {e.description}
                </AccentCard>
              ))}
            </div>
          </div>
        ) : null}
        {data.userStories?.length ? (
          <div>
            <SectionHeading title="User Stories" icon={BookOpen} />
            <SimpleDataTable
              headers={['Story', 'Epic', 'Priority', 'Effort', 'Dependencies']}
              rows={data.userStories.map((u) => [u.story, u.epic, u.priority, u.effort, u.dependencies])}
            />
          </div>
        ) : null}
        {data.acceptanceCriteria?.length ? (
          <div>
            <SectionHeading title="Acceptance Criteria" icon={CheckSquare} />
            <div className="space-y-3">
              {data.acceptanceCriteria.map((ac, i) => (
                <AccentCard key={i} title={ac.storyRef} accentColor="secondary">
                  <ul className="list-disc list-inside space-y-0.5">
                    {ac.criteria?.map((c, j) => (
                      <li key={j}>{c}</li>
                    ))}
                  </ul>
                </AccentCard>
              ))}
            </div>
          </div>
        ) : null}
        {data.mvpVsLater ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KeyValueCard
              title="MVP (ship first)"
              subtitle="Priority scope for launch"
              items={data.mvpVsLater.mvp}
              variant="primary"
            />
            <KeyValueCard
              title="Later"
              subtitle="Backlog for future releases"
              items={data.mvpVsLater.later}
              variant="muted"
            />
          </div>
        ) : null}
        {data.assumptions?.length ? (
          <div>
            <SectionHeading title="Assumptions" icon={AlertCircle} />
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
              {data.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {projectId && metricsCharts?.stage2?.length ? (
          <div>
            <SectionHeading title="Backlog metrics" icon={BarChart2} description="Priority, effort, and MVP vs Later distribution." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {metricsCharts.stage2.map((filename) => (
                <MetricsChartFigure key={filename} projectId={projectId} filename={filename} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
