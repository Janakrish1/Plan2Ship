interface StageIndicatorProps {
  currentStage: number;
  totalStages?: number;
}

const STAGE_LABELS: Record<number, string> = {
  1: "Strategy & Ideation",
  2: "Requirements & Dev",
  3: "Customer & Market",
  4: "Prototyping & Testing",
  5: "Go-to-Market",
};

export function StageIndicator({
  currentStage,
  totalStages = 5,
}: StageIndicatorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: totalStages }, (_, i) => i + 1).map((stage) => (
        <div
          key={stage}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            stage === currentStage
              ? "bg-primary text-primary-foreground"
              : stage < currentStage
                ? "bg-primary/20 text-primary"
                : "bg-white/10 text-muted-foreground"
          }`}
        >
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/20">
            {stage}
          </span>
          {stage === currentStage && (
            <span className="hidden sm:inline">
              {STAGE_LABELS[stage] ?? `Stage ${stage}`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
