"use client";

import type { Issue } from "../lib/api";

const STAGE_COLORS: Record<string, string> = {
  Introduction: "bg-blue-50 border-blue-200",
  Growth: "bg-emerald-50 border-emerald-200",
  Maturity: "bg-violet-50 border-violet-200",
  Decline: "bg-red-50 border-red-200",
  "New Development": "bg-amber-50 border-amber-200",
};

interface PLCBoardProps {
  stages: string[];
  issues: Issue[];
  onSelectIssue: (key: string) => void;
  onRefresh: () => void;
}

export function PLCBoard({ stages, issues, onSelectIssue, onRefresh }: PLCBoardProps) {
  const byStage = stages.reduce<Record<string, Issue[]>>((acc, s) => {
    acc[s] = issues.filter((i) => i.plc_stage === s);
    return acc;
  }, {});

  return (
    <div className="h-full">
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 120px)" }}>
        {stages.map((stage) => (
          <div
            key={stage}
            className={`flex-shrink-0 w-72 rounded-lg border-2 ${STAGE_COLORS[stage] || "bg-slate-50 border-slate-200"} flex flex-col`}
          >
            <h3 className="px-3 py-2 font-semibold text-slate-700 border-b border-slate-200/60">
              {stage}
            </h3>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {(byStage[stage] ?? []).map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.key)}
                  className="w-full text-left bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow hover:border-slate-300 transition"
                >
                  <div className="text-xs font-mono text-slate-500">{issue.key}</div>
                  <div className="font-medium text-slate-800 truncate">{issue.summary}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100">{issue.type}</span>
                    <span>{issue.priority}</span>
                    {issue.assignee && (
                      <span className="truncate">{issue.assignee.name}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
