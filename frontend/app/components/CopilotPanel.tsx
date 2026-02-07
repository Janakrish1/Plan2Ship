"use client";

import { useState, useRef } from "react";
import { api, type CopilotActionPlan } from "../lib/api";

interface CopilotPanelProps {
  projectKey: string | null;
  issueKey: string | null;
  onActionDone: () => void;
}

export function CopilotPanel({ projectKey, issueKey, onActionDone }: CopilotPanelProps) {
  const [message, setMessage] = useState("");
  const [pendingPlan, setPendingPlan] = useState<CopilotActionPlan | null>(null);
  const [history, setHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;
    setMessage("");
    setHistory((h) => [...h, { role: "user", text }]);
    setLoading(true);
    setPendingPlan(null);
    try {
      const res = await api<{ action_plan: CopilotActionPlan }>("/api/copilot/message", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          context: { projectKey: projectKey ?? undefined, issueKey: issueKey ?? undefined },
        }),
      });
      const plan = res.action_plan;
      setPendingPlan(plan);
      setHistory((h) => [
        ...h,
        {
          role: "assistant",
          text: plan.user_message + (plan.missing_requirements?.length ? "\n\n⚠️ " + plan.missing_requirements.map((m) => m.message).join(" ") : ""),
        },
      ]);
    } catch (err) {
      setHistory((h) => [...h, { role: "assistant", text: "Error: " + (err as Error).message }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const confirmExecute = async () => {
    if (!pendingPlan) return;
    setExecuting(true);
    try {
      const res = await api<{ results: unknown[] }>("/api/copilot/execute", {
        method: "POST",
        body: JSON.stringify({ action_plan: pendingPlan }),
      });
      setHistory((h) => [
        ...h,
        {
          role: "assistant",
          text: "Done. " + JSON.stringify(res.results, null, 2).slice(0, 300) + (res.results.some((r: { blocked?: boolean }) => r.blocked) ? " (some blocked)" : ""),
        },
      ]);
      setPendingPlan(null);
      onActionDone();
    } catch (err) {
      setHistory((h) => [...h, { role: "assistant", text: "Execute error: " + (err as Error).message }]);
    } finally {
      setExecuting(false);
    }
  };

  const cancelPlan = () => {
    setPendingPlan(null);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
        Copilot
      </h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 text-sm ${m.role === "user" ? "bg-blue-50 text-slate-800 ml-4" : "bg-slate-100 text-slate-700 mr-4"}`}
          >
            {m.text}
          </div>
        ))}
        {pendingPlan && (
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3 text-sm">
            <div className="font-medium text-amber-900 mb-2">Action plan</div>
            <div className="text-amber-800 mb-2">{pendingPlan.user_message}</div>
            <ul className="list-disc list-inside text-amber-800 mb-3">
              {pendingPlan.actions?.map((a, j) => (
                <li key={j}>
                  {a.tool}({Object.keys(a.args || {}).join(", ")})
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={confirmExecute}
                disabled={executing}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {executing ? "Executing…" : "Confirm"}
              </button>
              <button
                onClick={cancelPlan}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="e.g. Create a new task, Move to Growth, Generate launch checklist"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  );
}
