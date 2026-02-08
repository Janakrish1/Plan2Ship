import type { Stage5Analysis as Stage5Type, MetricsCharts } from '../types/project';
import { StageSection } from './StageSection';
import { MetricsChartFigure } from './MetricsChartFigure';
import { SectionHeading, InsightCard, GTMPlanBlock, AccentCard } from './content-blocks';
import { Users, MessageCircle, Calendar, FileText, Megaphone, BarChart2 } from 'lucide-react';

interface Stage5AnalysisProps {
  data: Stage5Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  projectId?: string;
  metricsCharts?: MetricsCharts;
  sectionId?: string;
}

export function Stage5Analysis({ data, onGenerate, isGenerating, projectId, metricsCharts, sectionId }: Stage5AnalysisProps) {
  if (!data) {
    return (
      <StageSection id={sectionId} stageNumber={5} title="Go-to-Market Execution">
        <p className="text-muted-foreground text-sm mb-3">
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
    <StageSection id={sectionId} stageNumber={5} title="Go-to-Market Execution" defaultOpen>
      <div className="space-y-5">
        {data.personas?.length ? (
          <div>
            <SectionHeading title="Personas" icon={Users} description="Target audiences and key messages" />
            <div className="space-y-3">
              {data.personas.map((p, i) => (
                <AccentCard key={i} title={p.type} subtitle={p.name} accentColor="primary">
                  {p.keyMessage && <p className="text-primary text-sm font-medium">Key message: {p.keyMessage}</p>}
                  {p.goals?.length ? <p className="text-sm mt-1"><span className="font-medium">Goals:</span> {p.goals.join('; ')}</p> : null}
                  {p.pains?.length ? <p className="text-sm"><span className="font-medium">Pains:</span> {p.pains.join('; ')}</p> : null}
                  {p.objections?.length ? <p className="text-sm"><span className="font-medium">Objections:</span> {p.objections.join('; ')}</p> : null}
                </AccentCard>
              ))}
            </div>
          </div>
        ) : null}
        {data.messaging ? (
          <div>
            <SectionHeading title="Messaging" icon={MessageCircle} description="Positioning and proof points" />
            {data.messaging.positioningStatement && (
              <InsightCard variant="primary" className="mb-3">
                <p className="text-foreground italic text-sm">"{data.messaging.positioningStatement}"</p>
              </InsightCard>
            )}
            {data.messaging.benefits?.length ? (
              <p className="text-sm"><span className="font-medium text-foreground">Benefits:</span> <span className="text-muted-foreground">{data.messaging.benefits.join('; ')}</span></p>
            ) : null}
            {data.messaging.proofPoints?.length ? (
              <p className="text-sm mt-1"><span className="font-medium text-foreground">Proof points:</span> <span className="text-muted-foreground">{data.messaging.proofPoints.join('; ')}</span></p>
            ) : null}
            {data.messaging.taglines?.length ? (
              <p className="text-sm mt-2"><span className="font-medium text-foreground">Taglines:</span> <span className="text-primary">{data.messaging.taglines.join(' | ')}</span></p>
            ) : null}
          </div>
        ) : null}
        {data.gtmPlan && Object.keys(data.gtmPlan).length ? (
          <div>
            <SectionHeading title="GTM Plan" icon={Calendar} description="Launch goals, channels, rollout, and risks" />
            <GTMPlanBlock plan={data.gtmPlan} />
          </div>
        ) : null}
        {data.releaseNotes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.releaseNotes.customerFacing && (
              <div className="rounded-xl border border-white/10 bg-card/30 p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Release notes (customer)</h4>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{data.releaseNotes.customerFacing}</p>
              </div>
            )}
            {data.releaseNotes.internal && (
              <div className="rounded-xl border border-white/10 bg-card/30 p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Release notes (internal)</h4>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{data.releaseNotes.internal}</p>
              </div>
            )}
          </div>
        ) : null}
        {data.stakeholderComms ? (
          <div>
            <SectionHeading title="Stakeholder Communication" icon={Megaphone} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.stakeholderComms.execs && (
                <AccentCard title="Execs" accentColor="primary">
                  <p className="whitespace-pre-wrap">{data.stakeholderComms.execs}</p>
                </AccentCard>
              )}
              {data.stakeholderComms.engineering && (
                <AccentCard title="Engineering / Design" accentColor="secondary">
                  <p className="whitespace-pre-wrap">{data.stakeholderComms.engineering}</p>
                </AccentCard>
              )}
              {data.stakeholderComms.support && (
                <AccentCard title="Support" accentColor="muted">
                  <p className="whitespace-pre-wrap">{data.stakeholderComms.support}</p>
                </AccentCard>
              )}
            </div>
          </div>
        ) : null}
        {data.metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.metrics.week1?.length ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Week 1 metrics</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-0.5">
                  {data.metrics.week1.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.metrics.month1?.length ? (
              <div className="rounded-xl border border-white/10 bg-card/30 p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Month 1 metrics</h4>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-0.5">
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
            <SectionHeading title="GTM metrics (charts)" icon={BarChart2} description="Persona mix and success metrics distribution." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {metricsCharts.stage5.map((filename) => (
                <MetricsChartFigure key={filename} projectId={projectId} filename={filename} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
