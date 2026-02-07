import { useState } from 'react';
import type { Stage4Analysis as Stage4Type, Project } from '../types/project';
import { StageSection } from './StageSection';
import { generateWireframeImage, getWireframeImageUrl } from '../services/api';

interface Stage4AnalysisProps {
  data: Stage4Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  onProjectUpdate?: (project: Project) => void;
}

export function Stage4Analysis({
  data,
  onGenerate,
  isGenerating,
  projectId,
  onProjectUpdate,
}: Stage4AnalysisProps) {
  const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);

  const handleGenerateMockup = async (index: number) => {
    if (!projectId || !onProjectUpdate) return;
    setGeneratingImageIndex(index);
    try {
      const updated = await generateWireframeImage(projectId, index);
      onProjectUpdate(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Mockup generation failed');
    } finally {
      setGeneratingImageIndex(null);
    }
  };

  if (!data) {
    return (
      <StageSection stageNumber={4} title="Prototyping & Testing">
        <p className="text-muted-foreground text-sm mb-4">
          User flows, text wireframes, usability test script, test cases, and iteration.
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
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
            <h4 className="font-medium text-foreground mb-2">User Flow</h4>
            {data.userFlow.description && (
              <p className="text-muted-foreground text-sm mb-2">{data.userFlow.description}</p>
            )}
            {data.userFlow.entryPoints?.length ? (
              <p className="text-sm">
                <span className="font-medium text-foreground">Entry points:</span>{' '}
                {data.userFlow.entryPoints.join(', ')}
              </p>
            ) : null}
            {data.userFlow.steps?.length ? (
              <ol className="list-decimal list-inside text-muted-foreground text-sm mt-2 space-y-1">
                {data.userFlow.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}
        {data.wireframes?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Wireframes & mockups</h4>
            <div className="space-y-4">
              {data.wireframes.map((w, i) => (
                <div key={i} className="border border-white/10 rounded-lg p-4 bg-card/40">
                  <div className="font-medium text-foreground">{w.screenName}</div>
                  <p className="text-muted-foreground text-sm mt-1">{w.purpose}</p>
                  {w.components?.length ? (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Components:</span> {w.components.join(', ')}
                    </p>
                  ) : null}
                  {w.microcopy?.length ? (
                    <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                      {w.microcopy.map((m, j) => (
                        <li key={j}>{m}</li>
                      ))}
                    </ul>
                  ) : null}
                  {projectId && onProjectUpdate ? (
                    <div className="mt-4">
                      {w.imagePath ? (
                        <div className="mt-2">
                          <img
                            src={getWireframeImageUrl(projectId, w.imagePath)}
                            alt={`Mockup: ${w.screenName}`}
                            className="max-w-full rounded-lg border border-white/10 shadow-sm max-h-96 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => handleGenerateMockup(i)}
                            disabled={generatingImageIndex !== null}
                            className="mt-2 text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generatingImageIndex === i ? 'Regenerating…' : 'Regenerate mockup'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateMockup(i)}
                          disabled={generatingImageIndex !== null}
                          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingImageIndex === i ? 'Generating…' : 'Generate mockup (AI image)'}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {scriptList.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Usability Test Script</h4>
            <ul className="space-y-2">
              {scriptList.map((s, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground">{s.task}</span>
                  <p className="text-muted-foreground text-sm mt-0.5">{s.script}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.testCases?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Test Cases</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-white/10">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-3 py-2 text-left font-medium text-foreground">Case</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Steps</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Expected</th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {data.testCases.map((t, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-3 py-2">{t.case}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t.steps}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t.expectedResult}</td>
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
            <h4 className="font-medium text-foreground mb-2">Iteration (Feedback → Change)</h4>
            <ul className="space-y-2">
              {data.iteration.map((it, i) => (
                <li key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-muted-foreground text-sm">{it.feedback}</p>
                  <p className="text-foreground text-sm mt-1 font-medium">→ {it.change}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
