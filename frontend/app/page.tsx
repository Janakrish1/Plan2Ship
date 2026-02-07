"use client";

import { useEffect, useState } from "react";
import { api, setToken, type Project, type Issue } from "./lib/api";
import { PLCBoard } from "./components/PLCBoard";
import { CopilotPanel } from "./components/CopilotPanel";
import { IssueDetail } from "./components/IssueDetail";
import Link from "next/link";

const STAGES = ["Introduction", "Growth", "Maturity", "Decline", "New Development"];

export default function Home() {
  const [token, setTokenState] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueKey, setSelectedIssueKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("pm@example.com");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setTokenState(t);
    if (!t) {
      setLoading(false);
      return;
    }
    api<Project[]>("/api/projects")
      .then(setProjects)
      .catch(() => setTokenState(null))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedProjectKey) {
      setIssues([]);
      return;
    }
    api<Issue[]>(`/api/projects/${selectedProjectKey}/issues`)
      .then(setIssues)
      .catch(() => setIssues([]));
  }, [token, selectedProjectKey]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { access_token } = await api<{ access_token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword || undefined }),
      });
      setToken(access_token);
      setTokenState(access_token);
      const list = await api<Project[]>("/api/projects");
      setProjects(list);
      if (list.length && !selectedProjectKey) setSelectedProjectKey(list[0].key);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const refreshIssues = () => {
    if (selectedProjectKey && token)
      api<Issue[]>(`/api/projects/${selectedProjectKey}/issues`).then(setIssues).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-semibold text-slate-800 mb-2">PLC Jira + Copilot</h1>
          <p className="text-slate-500 text-sm mb-6">Sign in (MVP: use pm@example.com)</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password (optional for seed user)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-slate-800">
            PLC Jira + Copilot
          </Link>
          <select
            value={selectedProjectKey ?? ""}
            onChange={(e) => setSelectedProjectKey(e.target.value || null)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.key}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
          <Link
            href={selectedProjectKey ? `/artifacts?project=${selectedProjectKey}` : "/artifacts"}
            className="text-sm text-blue-600 hover:underline"
          >
            Artifacts
          </Link>
        </div>
      </header>

      <main className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-auto p-4">
          {selectedProjectKey ? (
            <PLCBoard
              stages={STAGES}
              issues={issues}
              onSelectIssue={setSelectedIssueKey}
              onRefresh={refreshIssues}
            />
          ) : (
            <div className="text-slate-500 text-center py-12">Select a project to view the PLC board.</div>
          )}
        </div>
        <aside className="w-[380px] border-l border-slate-200 bg-white flex flex-col shrink-0">
          <CopilotPanel
            projectKey={selectedProjectKey}
            issueKey={selectedIssueKey}
            onActionDone={refreshIssues}
          />
        </aside>
      </main>

      {selectedIssueKey && (
        <IssueDetail
          issueKey={selectedIssueKey}
          onClose={() => setSelectedIssueKey(null)}
          onUpdated={refreshIssues}
        />
      )}
    </div>
  );
}
