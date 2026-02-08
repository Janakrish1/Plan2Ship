import { useState } from 'react';
import type { Stage4Analysis as Stage4Type, Project } from '../types/project';
import { StageSection } from './StageSection';
import { generateWireframeImage, getWireframeImageUrl } from '../services/api';
import { useImageLightbox } from './ImageLightbox';
import { DataTable } from './ui/data-table';
import { SectionHeading, AccentCard, InsightCard } from './content-blocks';
import { GitBranch, Layout, FileText, TestTube, RefreshCw } from 'lucide-react';

interface Stage4AnalysisProps {
  data: Stage4Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  onProjectUpdate?: (project: Project) => void;
  sectionId?: string;
}

export function Stage4Analysis({
  data,
  onGenerate,
  isGenerating,
  projectId,
  onProjectUpdate,
  sectionId,
}: Stage4AnalysisProps) {
  const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
  const { openLightbox } = useImageLightbox();

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
      <StageSection id={sectionId} stageNumber={4} title="Prototyping & Testing">
        <p className="text-muted-foreground text-sm mb-3">
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
    <StageSection id={sectionId} stageNumber={4} title="Prototyping & Testing" defaultOpen>
      <div className="space-y-5">
        {data.userFlow ? (
          <div>
            <SectionHeading title="User Flow" icon={GitBranch} description={data.userFlow.description} />
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
            <SectionHeading title="Wireframes & mockups" icon={Layout} description="Screens and components" />
            <div className="space-y-3">
              {data.wireframes.map((w, i) => (
                <AccentCard key={i} title={w.screenName} subtitle={w.purpose} accentColor="primary">
                  {w.components?.length ? (
                    <p className="text-sm">
                      <span className="font-medium">Components:</span> {w.components.join(', ')}
                    </p>
                  ) : null}
                  {w.microcopy?.length ? (
                    <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
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
                            className="max-w-full rounded-lg border border-white/10 shadow-sm max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openLightbox(getWireframeImageUrl(projectId, w.imagePath!), `Mockup: ${w.screenName}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && openLightbox(getWireframeImageUrl(projectId, w.imagePath!), `Mockup: ${w.screenName}`)}
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
                </AccentCard>
              ))}
            </div>
          </div>
        ) : null}
        {scriptList.length ? (
          <div>
            <SectionHeading title="Usability Test Script" icon={FileText} />
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
            <SectionHeading title="Test Cases" icon={TestTube} />
            <div className="overflow-x-auto">
              <DataTable
                columns={[
                  { key: 'case', label: 'Case', highlight: true },
                  { key: 'steps', label: 'Steps' },
                  { key: 'expectedResult', label: 'Expected' },
                  { key: 'priority', label: 'Priority' },
                ]}
                rows={data.testCases.map((t) => ({
                  case: t.case,
                  steps: t.steps,
                  expectedResult: t.expectedResult,
                  priority: t.priority,
                }))}
              />
            </div>
          </div>
        ) : null}
        {data.iteration?.length ? (
          <div>
            <SectionHeading title="Iteration (Feedback → Change)" icon={RefreshCw} />
            <div className="space-y-2">
              {data.iteration.map((it, i) => (
                <InsightCard key={i} variant="muted">
                  <p className="text-muted-foreground text-sm">{it.feedback}</p>
                  <p className="text-primary text-sm mt-1 font-medium">→ {it.change}</p>
                </InsightCard>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
