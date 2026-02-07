import { useState } from 'react';
import type { Project, Stage1Analysis as Stage1AnalysisType } from '../types/project';

interface Stage1AnalysisProps {
  project: Project;
  onSave: (data: { title: string; stage1Analysis: Stage1AnalysisType }) => Promise<void>;
  onBrainstorm: (additionalContext?: string) => Promise<void>;
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left font-medium text-gray-900 hover:bg-gray-100"
      >
        {title}
        <span className="text-gray-500">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

function ListItems({ items }: { items: string[] }) {
  if (!items?.length) return <p className="text-gray-500 text-sm">None identified.</p>;
  return (
    <ul className="list-disc list-inside space-y-1 text-gray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
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
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter project title"
        />
      </div>

      {analysis && (
        <>
          <Section title="Product ideas & concepts">
            <ListItems items={analysis.productIdeas} />
          </Section>
          <Section title="Market sizing">
            {analysis.marketSizing && Object.keys(analysis.marketSizing).length > 0 ? (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(analysis.marketSizing, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 text-sm">No structured data.</p>
            )}
          </Section>
          <Section title="Customer segments">
            <ListItems items={analysis.customerSegments} />
          </Section>
          <Section title="Business goals">
            <ListItems items={analysis.businessGoals} />
          </Section>
          <Section title="Scenario planning">
            <ListItems items={analysis.scenarios} />
          </Section>
          <Section title="Customer needs">
            <ListItems items={analysis.customerNeeds} />
          </Section>
          <Section title="Competitive insights">
            <p className="text-gray-700 whitespace-pre-wrap">
              {analysis.competitiveInsights || 'None.'}
            </p>
          </Section>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save / Update project'}
        </button>
        <div className="flex-1 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={brainstormContext}
            onChange={(e) => setBrainstormContext(e.target.value)}
            placeholder="Optional: focus area for more ideas"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleBrainstorm}
            disabled={brainstorming}
            className="px-4 py-2 rounded-lg border border-primary-600 text-primary-600 font-medium hover:bg-primary-50 disabled:opacity-50"
          >
            {brainstorming ? 'Thinking…' : 'Brainstorm more'}
          </button>
        </div>
      </div>

      {project.rawDocument && (
        <Section title="Original document content" defaultOpen={false}>
          <button
            type="button"
            onClick={() => setRawExpanded(!rawExpanded)}
            className="text-sm text-primary-600 hover:underline mb-2"
          >
            {rawExpanded ? 'Collapse' : 'Expand'} full text
          </button>
          {rawExpanded && (
            <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-96 overflow-auto bg-gray-50 p-3 rounded">
              {project.rawDocument}
            </pre>
          )}
        </Section>
      )}
    </div>
  );
}
