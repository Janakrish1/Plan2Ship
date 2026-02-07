import type { Stage4Analysis as Stage4Type } from '../types/project';
import { StageSection } from './StageSection';

interface Stage4AnalysisProps {
  data: Stage4Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export function Stage4Analysis({ data, onGenerate, isGenerating }: Stage4AnalysisProps) {
  if (!data) {
    return (
      <StageSection stageNumber={4} title="Prototyping & Testing">
        <p className="text-gray-600 text-sm mb-4">
          User flows, text wireframes, usability test script, test cases, and iteration.
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate Stage 4'}
        </button>
      </StageSection>
    );
  }

  const script = data.usabilityTestScript;
  const scriptList = Array.isArray(script)
    ? script
    : typeof script === 'string'
      ? [{ task: 'Script', script }]
      : [];

  return (
    <StageSection stageNumber={4} title="Prototyping & Testing" defaultOpen>
      <div className="space-y-6">
        {data.userFlow ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">User Flow</h4>
            {data.userFlow.description && (
              <p className="text-gray-600 text-sm mb-2">{data.userFlow.description}</p>
            )}
            {data.userFlow.entryPoints?.length ? (
              <p className="text-sm">
                <span className="font-medium text-gray-700">Entry points:</span>{' '}
                {data.userFlow.entryPoints.join(', ')}
              </p>
            ) : null}
            {data.userFlow.steps?.length ? (
              <ol className="list-decimal list-inside text-gray-600 text-sm mt-2 space-y-1">
                {data.userFlow.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}
        {data.wireframes?.length ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Wireframes (text)</h4>
            <div className="space-y-4">
              {data.wireframes.map((w, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-medium text-gray-800">{w.screenName}</div>
                  <p className="text-gray-600 text-sm mt-1">{w.purpose}</p>
                  {w.components?.length ? (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Components:</span> {w.components.join(', ')}
                    </p>
                  ) : null}
                  {w.microcopy?.length ? (
                    <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                      {w.microcopy.map((m, j) => (
                        <li key={j}>{m}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {scriptList.length ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Usability Test Script</h4>
            <ul className="space-y-2">
              {scriptList.map((s, i) => (
                <li key={i}>
                  <span className="font-medium text-gray-700">{s.task}</span>
                  <p className="text-gray-600 text-sm mt-0.5">{s.script}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.testCases?.length ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Test Cases</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Case</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Steps</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Expected</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {data.testCases.map((t, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-3 py-2">{t.case}</td>
                      <td className="px-3 py-2 text-gray-600">{t.steps}</td>
                      <td className="px-3 py-2 text-gray-600">{t.expectedResult}</td>
                      <td className="px-3 py-2">{t.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        {data.iteration?.length ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Iteration (Feedback → Change)</h4>
            <ul className="space-y-2">
              {data.iteration.map((it, i) => (
                <li key={i} className="border-l-2 border-primary-200 pl-3">
                  <p className="text-gray-600 text-sm">{it.feedback}</p>
                  <p className="text-gray-800 text-sm mt-1 font-medium">→ {it.change}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
