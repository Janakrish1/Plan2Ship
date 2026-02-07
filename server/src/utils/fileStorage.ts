import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
export const UPLOADS_DIR = path.join(ROOT, 'uploads');
export const DATA_DIR = path.join(ROOT, 'data', 'projects');

export async function ensureDirectories(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export function getProjectUploadDir(projectId: string): string {
  return path.join(UPLOADS_DIR, projectId);
}

export function getProjectWireframesDir(projectId: string): string {
  return path.join(UPLOADS_DIR, projectId, 'wireframes');
}

export function getProjectMetricsDir(projectId: string): string {
  return path.join(UPLOADS_DIR, projectId, 'metrics');
}

export function getMetricsChartPath(projectId: string, filename: string): string {
  return path.join(getProjectMetricsDir(projectId), filename);
}

export async function saveWireframeImage(
  projectId: string,
  index: number,
  buffer: Buffer
): Promise<string> {
  await ensureDirectories();
  const dir = getProjectWireframesDir(projectId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `screen-${index}-${Date.now()}.png`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return `wireframes/${filename}`;
}

export function getWireframeImagePath(projectId: string, relativePath: string): string {
  return path.join(getProjectUploadDir(projectId), relativePath);
}

export async function saveProjectFile(
  projectId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  await ensureDirectories();
  const projectDir = getProjectUploadDir(projectId);
  await fs.mkdir(projectDir, { recursive: true });
  const filePath = path.join(projectDir, filename);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export function getProjectFilePath(projectId: string, filename: string): string {
  return path.join(getProjectUploadDir(projectId), filename);
}

export function getProjectDataPath(projectId: string): string {
  return path.join(DATA_DIR, `${projectId}.json`);
}

export async function readProjectData(projectId: string): Promise<string | null> {
  const filePath = getProjectDataPath(projectId);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function writeProjectData(projectId: string, data: string): Promise<void> {
  await ensureDirectories();
  await fs.writeFile(getProjectDataPath(projectId), data, 'utf-8');
}

export async function listProjectIds(): Promise<string[]> {
  await ensureDirectories();
  const files = await fs.readdir(DATA_DIR);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

export async function deleteProject(projectId: string): Promise<void> {
  const dataPath = getProjectDataPath(projectId);
  const uploadDir = getProjectUploadDir(projectId);
  try {
    await fs.unlink(dataPath);
  } catch {
    // ignore if already missing
  }
  try {
    await fs.rm(uploadDir, { recursive: true, force: true });
  } catch {
    // ignore if already missing
  }
}
