interface StageIndicatorProps {
  currentStage: number;
  totalStages?: number;
}

const STAGE_LABELS: Record<number, string> = {
  1: 'Strategy & Ideation',
  2: 'Requirements & Dev',
  3: 'Customer & Market',
  4: 'Prototyping & Testing',
  5: 'Go-to-Market',
};

export function StageIndicator({ currentStage, totalStages = 5 }: StageIndicatorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: totalStages }, (_, i) => i + 1).map((stage) => (
        <div
          key={stage}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            stage === currentStage
              ? 'bg-primary-600 text-white'
              : stage < currentStage
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/20">
            {stage}
          </span>
          {stage === currentStage && (
            <span className="hidden sm:inline">{STAGE_LABELS[stage] ?? `Stage ${stage}`}</span>
          )}
        </div>
      ))}
    </div>
  );
}
