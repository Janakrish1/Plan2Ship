import type {
  Project,
  CreateProjectResponse,
  BrainstormRequest,
  BrainstormResponse,
  StageOptions,
} from '../types/project';

const API_BASE = '/api';

type RequestBody = FormData | object;

async function request<T>(
  path: string,
  options: Omit<RequestInit, 'body'> & { body?: RequestBody } = {}
): Promise<T> {
  const { body, ...rest } = options;
  const headers: HeadersInit = {
    ...(rest.headers as Record<string, string>),
  };
  let requestBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      requestBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: requestBody,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listProjects(): Promise<Project[]> {
  return request<Project[]>('/projects');
}

export async function getProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`);
}

export async function createProject(file: File): Promise<CreateProjectResponse> {
  const form = new FormData();
  form.append('document', file);
  return request<CreateProjectResponse>('/projects/create', {
    method: 'POST',
    body: form,
  });
}

export async function updateProject(
  id: string,
  data: { title?: string; stage1Analysis?: Project['stage1Analysis'] }
): Promise<Project> {
  return request<Project>(`/projects/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function brainstorm(
  id: string,
  payload: BrainstormRequest
): Promise<BrainstormResponse> {
  return request<BrainstormResponse>(`/projects/${id}/brainstorm`, {
    method: 'POST',
    body: payload,
  });
}

export async function deleteProject(id: string): Promise<void> {
  return request<void>(`/projects/${id}`, { method: 'DELETE' });
}

export async function runStageAnalysis(
  id: string,
  stage: 2 | 3 | 4 | 5,
  options?: StageOptions
): Promise<Project> {
  return request<Project>(`/projects/${id}/analyze-stage`, {
    method: 'POST',
    body: { stage, options },
  });
}

export async function generateWireframeImage(
  projectId: string,
  wireframeIndex: number
): Promise<Project> {
  const res = await request<{ imagePath: string; project: Project }>(
    `/projects/${projectId}/wireframe-image`,
    { method: 'POST', body: { wireframeIndex } }
  );
  return res.project;
}

export function getWireframeImageUrl(projectId: string, imagePath: string): string {
  const filename = imagePath.replace(/^wireframes\//, '');
  return `/api/projects/${projectId}/wireframe-image/${filename}`;
}

export function getMetricsChartUrl(projectId: string, filename: string): string {
  return `${API_BASE}/projects/${projectId}/metrics-chart/${filename}`;
}
