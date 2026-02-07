import { useState } from "react";

interface StageSectionProps {
  stageNumber: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function StageSection({
  stageNumber,
  title,
  children,
  defaultOpen = false,
}: StageSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden bg-card/40 backdrop-blur-lg border border-white/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 text-left transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm">
            {stageNumber}
          </span>
          <span className="font-semibold text-foreground">{title}</span>
        </span>
        <span className="text-muted-foreground text-sm">
          {open ? "▼ Collapse" : "▶ Expand"}
        </span>
      </button>
      {open && (
        <div className="p-5 border-t border-white/10 bg-card/20">{children}</div>
      )}
    </div>
  );
}
