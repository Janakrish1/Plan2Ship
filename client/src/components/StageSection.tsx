import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StageSectionProps {
  stageNumber: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
}

export function StageSection({
  stageNumber,
  title,
  children,
  defaultOpen = false,
  id,
}: StageSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-lg overflow-hidden bg-card/40 backdrop-blur-lg border border-white/10"
    >
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 text-left transition-colors"
        whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        whileTap={{ scale: 0.998 }}
      >
        <span className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-semibold text-xs">
            {stageNumber}
          </span>
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </span>
        <motion.span
          className="text-muted-foreground text-xs inline-block"
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-white/10 bg-card/20">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
