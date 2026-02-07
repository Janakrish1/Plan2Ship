"use client";

import { useEffect, useState } from "react";
import { api, type Issue, type AuditEvent } from "../lib/api";

const STAGES = ["Introduction", "Growth", "Maturity", "Decline", "New Development"];

interface IssueDetailProps {
  issueKey: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function IssueDetail({ issueKey, onClose, onUpdated }: IssueDetailProps) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [targetStage, setTargetStage] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [transitionResult, setTransitionResult] = useState<{ blocked?: boolean; message?: string; missing_requirements?: unknown[] } | null>(null);

  useEffect(() => {
    api<Issue>(`/api/issues/${issueKey}`).then(setIssue).catch(() => setIssue(null));
    api<AuditEvent[]>(`/api/issues/${issueKey}/audit`).then(setAudit).catch(() => setAudit([]));
  }, [issueKey]);

  const doTransition = async () => {
    if (!targetStage) return;
    setTransitioning(true);
    setTransitionResult(null);
    try {
      const res = await api<{ ok?: boolean; blocked?: boolean; message?: string; missing_requirements?: unknown[] }>(
        `/api/issues/${issueKey}/transition`,
        {
          method: "POST",
          body: JSON.stringify({ target_stage: targetStage, override_reason: overrideReason || undefined }),
        }
      );
      setTransitionResult(res);
      if (res.ok) {
        api<Issue>(`/api/issues/${issueKey}`).then(setIssue);
        onUpdated();
      }
    } catch (e) {
      setTransitionResult({ message: (e as Error).message });
    } finally {
      setTransitioning(false);
    }
  };

  if (!issue) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            {issue.key} — {issue.summary}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="text-sm text-slate-500 mb-1">Description</div>
            <p className="text-slate-800 whitespace-pre-wrap">{issue.description || "—"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Type</span> {issue.type}</div>
            <div><span className="text-slate-500">Status</span> {issue.status}</div>
            <div><span className="text-slate-500">PLC Stage</span> {issue.plc_stage}</div>
            <div><span className="text-slate-500">Priority</span> {issue.priority}</div>
            <div><span className="text-slate-500">Assignee</span> {issue.assignee?.name ?? "—"}</div>
            <div><span className="text-slate-500">Regulatory</span> {issue.regulatory_impact}</div>
          </div>

          {issue.evidence_links && issue.evidence_links.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Evidence links</div>
              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                {issue.evidence_links.map((l: { title?: string; url?: string }, i: number) => (
                  <li key={i}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {l.title || l.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {issue.stage_exit_criteria && issue.stage_exit_criteria.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Stage exit checklist</div>
              <ul className="space-y-1">
                {issue.stage_exit_criteria.map((c: { text?: string; done?: boolean }, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!c.done} readOnly className="rounded" />
                    <span>{c.text ?? "Item"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Transition stage</div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Select target stage</option>
                {STAGES.filter((s) => s !== issue.plc_stage).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Override reason (admin)"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-48"
              />
              <button
                onClick={doTransition}
                disabled={!targetStage || transitioning}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {transitioning ? "Transitioning…" : "Transition"}
              </button>
            </div>
            {transitionResult?.blocked && (
              <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                {transitionResult.message}
                {transitionResult.missing_requirements?.map((m: { message?: string }, i: number) => (
                  <div key={i}>{m.message}</div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Audit timeline</div>
            <ul className="space-y-2 text-sm">
              {audit.slice(0, 20).map((e) => (
                <li key={e.id} className="flex gap-2 text-slate-600">
                  <span className="text-slate-400 shrink-0">{e.created_at.slice(0, 19)}</span>
                  <span>{e.action_type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
