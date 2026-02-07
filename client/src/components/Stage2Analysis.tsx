import type { Stage2Analysis as Stage2Type, MetricsCharts } from '../types/project';
import { StageSection } from './StageSection';
import { getMetricsChartUrl } from '../services/api';

interface Stage2AnalysisProps {
  data: Stage2Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  metricsCharts?: MetricsCharts;
}

function Table({ headers, rows }: { headers: string[]; rows: (string | undefined)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-white/10">
        <thead>
          <tr className="bg-white/5">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-foreground border-b border-white/10">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-foreground">
                  {cell ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Stage2Analysis({ data, onGenerate, isGenerating, projectId, metricsCharts }: Stage2AnalysisProps) {
  if (!data) {
    return (
      <StageSection stageNumber={2} title="Requirements & Development">
        <p className="text-muted-foreground text-sm mb-4">
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
    <StageSection stageNumber={2} title="Requirements & Development" defaultOpen>
      <div className="space-y-6">
        {data.epics?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Epics</h4>
            <ul className="space-y-2">
              {data.epics.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-medium text-foreground">{e.name}:</span>
                  <span className="text-muted-foreground">{e.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.userStories?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">User Stories</h4>
            <Table
              headers={['Story', 'Epic', 'Priority', 'Effort', 'Dependencies']}
              rows={data.userStories.map((u) => [u.story, u.epic, u.priority, u.effort, u.dependencies])}
            />
          </div>
        ) : null}
        {data.acceptanceCriteria?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Acceptance Criteria</h4>
            <ul className="space-y-3">
              {data.acceptanceCriteria.map((ac, i) => (
                <li key={i}>
                  <span className="text-muted-foreground font-medium">{ac.storyRef}</span>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground text-sm">
                    {ac.criteria?.map((c, j) => (
                      <li key={j}>{c}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.mvpVsLater ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">MVP (ship first)</h4>
              <ul className="list-disc list-inside text-muted-foreground text-sm">
                {data.mvpVsLater.mvp?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Later</h4>
              <ul className="list-disc list-inside text-muted-foreground text-sm">
                {data.mvpVsLater.later?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {data.assumptions?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Assumptions</h4>
            <ul className="list-disc list-inside text-muted-foreground text-sm">
              {data.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {projectId && metricsCharts?.stage2?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Backlog metrics</h4>
            <p className="text-muted-foreground text-sm mb-3">Priority, effort, and MVP vs Later distribution.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricsCharts.stage2.map((filename) => (
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
