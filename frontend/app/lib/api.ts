const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || String(err) || res.statusText);
  }
  return res.json();
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("token");
}

export interface Project {
  id: number;
  name: string;
  key: string;
}

export interface UserBrief {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Issue {
  id: number;
  key: string;
  project_id: number;
  type: string;
  summary: string;
  description: string | null;
  status: string;
  plc_stage: string;
  assignee_id: number | null;
  reporter_id: number | null;
  priority: string;
  regulatory_impact: string;
  stage_exit_criteria: { text?: string; done?: boolean }[];
  evidence_links: { title?: string; url?: string }[];
  created_at: string;
  updated_at: string;
  assignee: UserBrief | null;
  reporter: UserBrief | null;
}

export interface Artifact {
  id: number;
  issue_id: number | null;
  project_id: number;
  kind: string;
  title: string;
  content: string | null;
  sources: unknown[];
  status: string;
  created_by: number | null;
  created_at: string;
}

export interface AuditEvent {
  id: number;
  actor_user_id: number | null;
  action_type: string;
  object_type: string;
  object_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface CopilotActionPlan {
  intent: string;
  requires_confirmation: boolean;
  actions: { tool: string; args: Record<string, unknown> }[];
  user_message: string;
  missing_requirements: { type: string; message: string }[];
}
