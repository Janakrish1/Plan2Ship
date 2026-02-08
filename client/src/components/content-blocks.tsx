import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Section with optional icon, accent bar, and collapsible content */
export function ContentSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-xl border border-white/10 overflow-hidden bg-card/30", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/8 text-left transition-colors border-b border-white/5"
      >
        {Icon && (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary shrink-0">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <span className="font-semibold text-foreground flex-1">{title}</span>
        <span className="text-muted-foreground">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t-0 bg-card/20">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Highlight block for key insights, positioning, quotes */
export function InsightCard({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 border-l-4",
        variant === "primary" && "bg-primary/10 border-primary/50 text-foreground",
        variant === "muted" && "bg-white/5 border-white/20 text-muted-foreground",
        variant === "default" && "bg-white/5 border-primary/30 text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Bullet list with accent markers */
export function ListBlock({
  items,
  emptyMessage = "None identified.",
  className,
}: {
  items: string[] | undefined;
  emptyMessage?: string;
  className?: string;
}) {
  if (!items?.length) {
    return <p className={cn("text-muted-foreground text-sm", className)}>{emptyMessage}</p>;
  }
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 items-start">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 flex-shrink-0" />
          <span className="text-foreground text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Two-column key value (e.g. MVP vs Later) with distinct styling */
export function KeyValueCard({
  title,
  subtitle,
  items,
  variant = "default",
  className,
}: {
  title: string;
  subtitle?: string;
  items: string[] | undefined;
  variant?: "default" | "primary" | "muted";
  className?: string;
}) {
  const styles = {
    default: "border-white/10 bg-card/40",
    primary: "border-primary/30 bg-primary/5",
    muted: "border-white/5 bg-white/[0.03]",
  };
  return (
    <div className={cn("rounded-xl border p-4", styles[variant], className)}>
      <h4 className="font-semibold text-foreground text-sm">{title}</h4>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      {items?.length ? (
        <ul className="mt-2 space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
          {items.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm mt-2">—</p>
      )}
    </div>
  );
}

/** Styled JSON / pre block */
export function JsonBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        "text-sm text-foreground/90 bg-white/5 border border-white/10 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono",
        className
      )}
    >
      {children}
    </pre>
  );
}

/** Small card with left accent for epic, trend, or list item */
export function AccentCard({
  title,
  subtitle,
  children,
  accentColor = "primary",
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  accentColor?: "primary" | "secondary" | "muted";
  className?: string;
}) {
  const border = {
    primary: "border-l-primary/60",
    secondary: "border-l-secondary/60",
    muted: "border-l-white/20",
  };
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 border-l-4 bg-card/30 p-3",
        border[accentColor],
        className
      )}
    >
      <div className="font-medium text-foreground">{title}</div>
      {subtitle && <div className="text-muted-foreground text-sm mt-0.5">{subtitle}</div>}
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

/** Readable GTM Plan: launchGoals, channels, rollout, risks */
export function GTMPlanBlock({
  plan,
  className,
}: {
  plan: {
    launchGoals?: string[];
    channels?: string[];
    rollout?: string;
    risks?: string[];
    [key: string]: unknown;
  };
  className?: string;
}) {
  const sections: { label: string; content: React.ReactNode }[] = [];

  if (plan.launchGoals?.length) {
    sections.push({
      label: "Launch goals",
      content: (
        <ul className="space-y-2">
          {plan.launchGoals.map((g, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 flex-shrink-0" />
              <span className="text-foreground text-sm">{g}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (plan.channels?.length) {
    sections.push({
      label: "Channels",
      content: (
        <ul className="space-y-2">
          {plan.channels.map((c, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0 flex-shrink-0" />
              <span className="text-foreground text-sm">{c}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (plan.rollout) {
    sections.push({
      label: "Rollout",
      content: (
        <p className="text-foreground text-sm leading-relaxed">{plan.rollout}</p>
      ),
    });
  }
  if (plan.risks?.length) {
    sections.push({
      label: "Risks",
      content: (
        <ul className="space-y-2">
          {plan.risks.map((r, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 mt-2 shrink-0 flex-shrink-0" />
              <span className="text-foreground text-sm">{r}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  // Fallback: any other keys as raw JSON for flexibility
  const knownKeys = new Set(["launchGoals", "channels", "rollout", "risks"]);
  const otherKeys = Object.keys(plan).filter((k) => !knownKeys.has(k) && plan[k] != null);
  if (otherKeys.length > 0) {
    const rest: Record<string, unknown> = {};
    otherKeys.forEach((k) => (rest[k] = plan[k]));
    sections.push({
      label: "More details",
      content: (
        <pre className="text-xs text-muted-foreground bg-white/5 border border-white/10 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
          {JSON.stringify(rest, null, 2)}
        </pre>
      ),
    });
  }

  if (sections.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {sections.map((s, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-card/30 p-4">
          <h5 className="font-semibold text-foreground text-sm mb-2">{s.label}</h5>
          {s.content}
        </div>
      ))}
    </div>
  );
}

/** Humanize camelCase key to title (e.g. highFrequencyShoppers → High frequency shoppers) */
function humanizeLabel(key: string): string {
  const withSpaces = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
  const acronyms: Record<string, string> = { bnpl: "BNPL", api: "API", gtm: "GTM", mvp: "MVP" };
  return withSpaces
    .split(" ")
    .map((word) => acronyms[word.toLowerCase()] ?? word)
    .join(" ");
}

/** Readable Market Sizing: object of string keys → string values as labeled cards */
export function MarketSizingBlock({
  data,
  className,
}: {
  data: Record<string, unknown>;
  className?: string;
}) {
  const entries = Object.entries(data).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim() !== ""
  );
  if (entries.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-xl border border-white/10 bg-card/30 p-4 border-l-4 border-l-primary/50"
        >
          <h5 className="font-semibold text-foreground text-sm mb-1.5">{humanizeLabel(key)}</h5>
          <p className="text-muted-foreground text-sm leading-relaxed">{value}</p>
        </div>
      ))}
    </div>
  );
}

/** Section heading with optional icon */
export function SectionHeading({
  title,
  icon: Icon,
  description,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/15 text-primary">
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      {description && <p className="text-muted-foreground text-xs mt-1">{description}</p>}
    </div>
  );
}
