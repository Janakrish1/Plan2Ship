"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, type Artifact } from "../lib/api";

export default function ArtifactsPage() {
  const searchParams = useSearchParams();
  const projectKey = searchParams.get("project");
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectKey) {
      setArtifacts([]);
      setLoading(false);
      return;
    }
    api<Artifact[]>(`/api/projects/${projectKey}/artifacts`)
      .then(setArtifacts)
      .catch(() => setArtifacts([]))
      .finally(() => setLoading(false));
  }, [projectKey]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-2">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to board
        </Link>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-4">
          Artifacts {projectKey ? `(${projectKey})` : ""}
        </h1>
        {!projectKey ? (
          <p className="text-slate-500">Select a project from the URL: /artifacts?project=PROJ</p>
        ) : loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <div className="space-y-3">
            {artifacts.length === 0 ? (
              <p className="text-slate-500">No artifacts yet.</p>
            ) : (
              artifacts.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-800">{a.title}</span>
                      <span className="ml-2 text-sm text-slate-500">{a.kind}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-sm ${
                        a.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : a.status === "draft"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    ID {a.id} · Created {a.created_at.slice(0, 10)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
