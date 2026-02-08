import { useState } from 'react';
import type { Project, Stage1Analysis as Stage1AnalysisType } from '../types/project';
import { MetricsChartFigure } from './MetricsChartFigure';
import {
  ContentSection,
  ListBlock,
  InsightCard,
  MarketSizingBlock,
} from './content-blocks';
import { Lightbulb, BarChart3, Users, Target, GitBranch, Heart, Swords, LineChart } from 'lucide-react';

interface Stage1AnalysisProps {
  project: Project;
  onSave: (data: { title: string; stage1Analysis: Stage1AnalysisType }) => Promise<void>;
  onBrainstorm: (additionalContext?: string) => Promise<void>;
}

export function Stage1Analysis({ project, onSave, onBrainstorm }: Stage1AnalysisProps) {
  const [title, setTitle] = useState(project.title || '');
  const [saving, setSaving] = useState(false);
  const [brainstorming, setBrainstorming] = useState(false);
  const [brainstormContext, setBrainstormContext] = useState('');
  const [rawExpanded, setRawExpanded] = useState(false);

  const analysis = project.stage1Analysis;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ title, stage1Analysis: analysis! });
    } finally {
      setSaving(false);
    }
  };

  const handleBrainstorm = async () => {
    setBrainstorming(true);
    try {
      await onBrainstorm(brainstormContext.trim() || undefined);
      setBrainstormContext('');
    } finally {
      setBrainstorming(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-card/30 p-4">
        <label className="block text-sm font-medium text-foreground mb-2">Project title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-background/80 px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="Enter project title"
        />
      </div>

      {analysis && (
        <>
          <ContentSection title="Product ideas & concepts" icon={Lightbulb}>
            <ListBlock items={analysis.productIdeas} />
          </ContentSection>
          <ContentSection title="Market sizing" icon={BarChart3}>
            {analysis.marketSizing && Object.keys(analysis.marketSizing).length > 0 ? (
              <MarketSizingBlock data={analysis.marketSizing as Record<string, unknown>} />
            ) : (
              <p className="text-muted-foreground text-sm">No structured data.</p>
            )}
          </ContentSection>
          <ContentSection title="Customer segments" icon={Users}>
            <ListBlock items={analysis.customerSegments} />
          </ContentSection>
          <ContentSection title="Business goals" icon={Target}>
            <ListBlock items={analysis.businessGoals} />
          </ContentSection>
          <ContentSection title="Scenario planning" icon={GitBranch}>
            <ListBlock items={analysis.scenarios} />
          </ContentSection>
          <ContentSection title="Customer needs" icon={Heart}>
            <ListBlock items={analysis.customerNeeds} />
          </ContentSection>
          <ContentSection title="Competitive insights" icon={Swords}>
            <InsightCard variant="primary">
              <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">
                {analysis.competitiveInsights || 'None.'}
              </p>
            </InsightCard>
          </ContentSection>
          {project.metricsCharts?.stage1?.length ? (
            <ContentSection title="Market & strategy metrics" icon={LineChart}>
              <p className="text-muted-foreground text-sm mb-3">Charts from market sizing and scenario analysis.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {project.metricsCharts.stage1.map((filename) => (
                  <MetricsChartFigure key={filename} projectId={project.id} filename={filename} />
                ))}
              </div>
            </ContentSection>
          ) : null}
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save / Update project'}
        </button>
        <div className="flex-1 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={brainstormContext}
            onChange={(e) => setBrainstormContext(e.target.value)}
            placeholder="Optional: focus area for more ideas"
            className="flex-1 min-w-[200px] rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleBrainstorm}
            disabled={brainstorming}
            className="px-4 py-2 rounded-lg border border-primary text-primary font-medium hover:bg-primary/20 disabled:opacity-50"
          >
            {brainstorming ? 'Thinking…' : 'Brainstorm more'}
          </button>
        </div>
      </div>

      {project.rawDocument && (
        <ContentSection title="Original document content" defaultOpen={false}>
          <button
            type="button"
            onClick={() => setRawExpanded(!rawExpanded)}
            className="text-sm text-primary hover:underline mb-2"
          >
            {rawExpanded ? 'Collapse' : 'Expand'} full text
          </button>
          {rawExpanded && (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-96 overflow-auto bg-white/5 p-3 rounded-lg border border-white/10 font-mono">
              {project.rawDocument}
            </pre>
          )}
        </ContentSection>
      )}
    </div>
  );
}
