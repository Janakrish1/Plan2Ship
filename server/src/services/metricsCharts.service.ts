import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { getProjectDataPath, getProjectMetricsDir, getMetricsChartPath } from '../utils/fileStorage.js';
import type { MetricsCharts } from '../models/project.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = path.resolve(__dirname, '../../scripts');
const METRICS_SCRIPT = path.join(SCRIPTS_DIR, 'metrics_charts.py');

/**
 * Run Python metrics_charts.py for a given stage and project.
 * Writes PNGs to uploads/<projectId>/metrics/ and returns list of filenames.
 */
export async function generateMetricsCharts(
  projectId: string,
  stage: 1 | 2 | 3 | 5
): Promise<string[]> {
  const dataPath = getProjectDataPath(projectId);
  const outputDir = getProjectMetricsDir(projectId);
  await fs.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const py = spawn('python3', [METRICS_SCRIPT, '--stage', String(stage), '--data', dataPath, '--output-dir', outputDir], {
      cwd: SCRIPTS_DIR,
    });
    let stderr = '';
    let stdout = '';
    py.stderr?.on('data', (d) => { stderr += d.toString(); });
    py.stdout?.on('data', (d) => { stdout += d.toString(); });
    py.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Metrics script failed: ${stderr || stdout || code}`));
        return;
      }
      try {
        const out = stdout.trim();
        const lastLine = out.split('\n').pop() ?? '{}';
        const parsed = JSON.parse(lastLine) as { generated?: string[] };
        resolve(parsed.generated ?? []);
      } catch {
        resolve([]);
      }
    });
    py.on('error', (err) => reject(err));
  });
}

/**
 * Generate charts for multiple stages and return updated metricsCharts object.
 */
export async function generateMetricsChartsForStages(
  projectId: string,
  stages: (1 | 2 | 3 | 5)[]
): Promise<MetricsCharts> {
  const result: MetricsCharts = {};
  for (const stage of stages) {
    try {
      const generated = await generateMetricsCharts(projectId, stage);
      if (stage === 1) result.stage1 = generated;
      else if (stage === 2) result.stage2 = generated;
      else if (stage === 3) result.stage3 = generated;
      else if (stage === 5) result.stage5 = generated;
    } catch (e) {
      console.warn(`Metrics charts for stage ${stage} skipped:`, e);
    }
  }
  return result;
}

export { getMetricsChartPath };
