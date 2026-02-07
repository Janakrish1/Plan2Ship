import type { Stage5Analysis as Stage5Type, MetricsCharts } from '../types/project';
import { StageSection } from './StageSection';
import { getMetricsChartUrl } from '../services/api';

interface Stage5AnalysisProps {
  data: Stage5Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  metricsCharts?: MetricsCharts;
}

export function Stage5Analysis({ data, onGenerate, isGenerating, projectId, metricsCharts }: Stage5AnalysisProps) {
  if (!data) {
    return (
      <StageSection stageNumber={5} title="Go-to-Market Execution">
        <p className="text-muted-foreground text-sm mb-4">
          Personas, messaging, GTM plan, release notes, and stakeholder comms.
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate Stage 5'}
        </button>
      </StageSection>
    );
  }

  return (
    <StageSection stageNumber={5} title="Go-to-Market Execution" defaultOpen>
      <div className="space-y-6">
        {data.personas?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Personas</h4>
            <div className="space-y-4">
              {data.personas.map((p, i) => (
                <div key={i} className="border border-white/10 rounded-lg p-4 bg-card/40">
                  <div className="font-medium text-foreground capitalize">{p.type}</div>
                  {p.name && <p className="text-muted-foreground text-sm">{p.name}</p>}
                  {p.keyMessage && <p className="text-primary text-sm mt-1">Key message: {p.keyMessage}</p>}
                  {p.goals?.length ? <p className="text-sm mt-2"><span className="font-medium">Goals:</span> {p.goals.join('; ')}</p> : null}
                  {p.pains?.length ? <p className="text-sm"><span className="font-medium">Pains:</span> {p.pains.join('; ')}</p> : null}
                  {p.objections?.length ? <p className="text-sm"><span className="font-medium">Objections:</span> {p.objections.join('; ')}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {data.messaging ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Messaging</h4>
            {data.messaging.positioningStatement && (
              <p className="text-foreground italic mb-2">"{data.messaging.positioningStatement}"</p>
            )}
            {data.messaging.benefits?.length ? (
              <p className="text-sm"><span className="font-medium">Benefits:</span> {data.messaging.benefits.join('; ')}</p>
            ) : null}
            {data.messaging.proofPoints?.length ? (
              <p className="text-sm mt-1"><span className="font-medium">Proof points:</span> {data.messaging.proofPoints.join('; ')}</p>
            ) : null}
            {data.messaging.taglines?.length ? (
              <p className="text-sm mt-2"><span className="font-medium">Taglines:</span> {data.messaging.taglines.join(' | ')}</p>
            ) : null}
          </div>
        ) : null}
        {data.gtmPlan && Object.keys(data.gtmPlan).length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">GTM Plan</h4>
            <pre className="text-sm text-foreground bg-white/5 border border-white/10 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(data.gtmPlan, null, 2)}
            </pre>
          </div>
        ) : null}
        {data.releaseNotes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.releaseNotes.customerFacing && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Release notes (customer)</h4>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{data.releaseNotes.customerFacing}</p>
              </div>
            )}
            {data.releaseNotes.internal && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Release notes (internal)</h4>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{data.releaseNotes.internal}</p>
              </div>
            )}
          </div>
        ) : null}
        {data.stakeholderComms ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">Stakeholder Communication</h4>
            <div className="space-y-3">
              {data.stakeholderComms.execs && (
                <div>
                  <span className="font-medium text-foreground text-sm">Execs:</span>
                  <p className="text-muted-foreground text-sm mt-0.5">{data.stakeholderComms.execs}</p>
                </div>
              )}
              {data.stakeholderComms.engineering && (
                <div>
                  <span className="font-medium text-foreground text-sm">Engineering/Design:</span>
                  <p className="text-muted-foreground text-sm mt-0.5">{data.stakeholderComms.engineering}</p>
                </div>
              )}
              {data.stakeholderComms.support && (
                <div>
                  <span className="font-medium text-foreground text-sm">Support:</span>
                  <p className="text-muted-foreground text-sm mt-0.5">{data.stakeholderComms.support}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
        {data.metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.metrics.week1?.length ? (
              <div>
                <h4 className="font-medium text-foreground mb-2">Week 1 metrics</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm">
                  {data.metrics.week1.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.metrics.month1?.length ? (
              <div>
                <h4 className="font-medium text-foreground mb-2">Month 1 metrics</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm">
                  {data.metrics.month1.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
        {projectId && metricsCharts?.stage5?.length ? (
          <div>
            <h4 className="font-medium text-foreground mb-2">GTM metrics (charts)</h4>
            <p className="text-muted-foreground text-sm mb-3">Persona mix and success metrics distribution.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metricsCharts.stage5.map((filename) => (
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
