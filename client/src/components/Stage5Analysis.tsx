import type { Stage5Analysis as Stage5Type } from '../types/project';
import { StageSection } from './StageSection';

interface Stage5AnalysisProps {
  data: Stage5Type | undefined;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export function Stage5Analysis({ data, onGenerate, isGenerating }: Stage5AnalysisProps) {
  if (!data) {
    return (
      <StageSection stageNumber={5} title="Go-to-Market Execution">
        <p className="text-gray-600 text-sm mb-4">
          Personas, messaging, GTM plan, release notes, and stakeholder comms.
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
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
            <h4 className="font-medium text-gray-900 mb-2">Personas</h4>
            <div className="space-y-4">
              {data.personas.map((p, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-medium text-gray-800 capitalize">{p.type}</div>
                  {p.name && <p className="text-gray-600 text-sm">{p.name}</p>}
                  {p.keyMessage && <p className="text-primary-700 text-sm mt-1">Key message: {p.keyMessage}</p>}
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
            <h4 className="font-medium text-gray-900 mb-2">Messaging</h4>
            {data.messaging.positioningStatement && (
              <p className="text-gray-700 italic mb-2">"{data.messaging.positioningStatement}"</p>
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
            <h4 className="font-medium text-gray-900 mb-2">GTM Plan</h4>
            <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(data.gtmPlan, null, 2)}
            </pre>
          </div>
        ) : null}
        {data.releaseNotes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.releaseNotes.customerFacing && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Release notes (customer)</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{data.releaseNotes.customerFacing}</p>
              </div>
            )}
            {data.releaseNotes.internal && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Release notes (internal)</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{data.releaseNotes.internal}</p>
              </div>
            )}
          </div>
        ) : null}
        {data.stakeholderComms ? (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Stakeholder Communication</h4>
            <div className="space-y-3">
              {data.stakeholderComms.execs && (
                <div>
                  <span className="font-medium text-gray-700 text-sm">Execs:</span>
                  <p className="text-gray-600 text-sm mt-0.5">{data.stakeholderComms.execs}</p>
                </div>
              )}
              {data.stakeholderComms.engineering && (
                <div>
                  <span className="font-medium text-gray-700 text-sm">Engineering/Design:</span>
                  <p className="text-gray-600 text-sm mt-0.5">{data.stakeholderComms.engineering}</p>
                </div>
              )}
              {data.stakeholderComms.support && (
                <div>
                  <span className="font-medium text-gray-700 text-sm">Support:</span>
                  <p className="text-gray-600 text-sm mt-0.5">{data.stakeholderComms.support}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
        {data.metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.metrics.week1?.length ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Week 1 metrics</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {data.metrics.week1.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.metrics.month1?.length ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Month 1 metrics</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {data.metrics.month1.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </StageSection>
  );
}
