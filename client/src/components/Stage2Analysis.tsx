import type { Stage2Analysis as Stage2Type } from '../types/project';
import { StageSection } from './StageSection';

interface Stage2AnalysisProps {
  data: Stage2Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

function Table({ headers, rows }: { headers: string[]; rows: (string | undefined)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-700">
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

export function Stage2Analysis({ data, onGenerate, isGenerating }: Stage2AnalysisProps) {
  if (!data) {
    return (
      <StageSection stageNumber={2} title="Requirements & Development">
        <p className="text-gray-600 text-sm mb-4">
          Epics, user stories, acceptance criteria, and backlog (MVP vs Later).
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
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
            <h4 className="font-medium text-gray-900 mb-2">Epics</h4>
            <ul className="space-y-2">
              {data.epics.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-medium text-gray-700">{e.name}:</span>
                  <span className="text-gray-600">{e.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.userStories?.length ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">User Stories</h4>
            <Table
              headers={['Story', 'Epic', 'Priority', 'Effort', 'Dependencies']}
              rows={data.userStories.map((u) => [u.story, u.epic, u.priority, u.effort, u.dependencies])}
            />
          </div>
        ) : null}
        {data.acceptanceCriteria?.length ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Acceptance Criteria</h4>
            <ul className="space-y-3">
              {data.acceptanceCriteria.map((ac, i) => (
                <li key={i}>
                  <span className="text-gray-600 font-medium">{ac.storyRef}</span>
                  <ul className="list-disc list-inside mt-1 text-gray-600 text-sm">
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
              <h4 className="font-medium text-gray-900 mb-2">MVP (ship first)</h4>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {data.mvpVsLater.mvp?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Later</h4>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {data.mvpVsLater.later?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {data.assumptions?.length ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Assumptions</h4>
            <ul className="list-disc list-inside text-gray-600 text-sm">
              {data.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
