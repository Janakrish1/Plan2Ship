import {
  Lightbulb,
  Layers,
  LineChart,
  MessageSquare,
  Rocket,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STAGES: { num: number; label: string; short: string; icon: React.ElementType }[] = [
  { num: 1, label: "Strategy & Ideation", short: "Strategy", icon: Lightbulb },
  { num: 2, label: "Requirements & Dev", short: "Requirements", icon: Layers },
  { num: 3, label: "Customer & Market", short: "Research", icon: LineChart },
  { num: 4, label: "Prototyping & Testing", short: "Testing", icon: MessageSquare },
  { num: 5, label: "Go-to-Market", short: "GTM", icon: Rocket },
];

interface StageStepperNavProps {
  currentStage: number;
  activeStage: number;
  onStageChange: (stage: number) => void;
}

export function StageStepperNav({ currentStage, activeStage, onStageChange }: StageStepperNavProps) {
  return (
    <nav className="sticky top-16 z-20 w-full" aria-label="Project stages">
      <div className="rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl p-1 shadow-xl ring-1 ring-white/5">
        <div className="flex items-stretch gap-0.5">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.num;
            const isCompleted = currentStage > stage.num;

            return (
              <motion.button
                key={stage.num}
                type="button"
                onClick={() => onStageChange(stage.num)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "group relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 px-2 sm:px-3 transition-colors duration-300 min-w-0",
                  "cursor-pointer hover:bg-white/5",
                  isActive &&
                    "bg-gradient-to-r from-primary/20 to-primary/10 ring-1 ring-primary/40 shadow-lg shadow-primary/10"
                )}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Stage ${stage.num}: ${stage.label}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="stage-tab-glow"
                    className="absolute inset-0 rounded-lg bg-primary/10 pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    aria-hidden
                  />
                )}
                <motion.span
                  className={cn(
                    "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-colors duration-300",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground shadow-md",
                    isCompleted && !isActive &&
                      "border-primary/50 bg-primary/15 text-primary",
                    !isActive && !isCompleted &&
                      "border-white/20 bg-white/5 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary"
                  )}
                  animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </motion.span>
                <span
                  className={cn(
                    "relative hidden text-xs font-semibold leading-tight sm:block md:text-sm truncate max-w-[96px] min-w-0",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {stage.short}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
