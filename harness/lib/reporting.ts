import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RunResult, SuiteSummary } from './metrics.ts';

export function writeRunResult(outputDir: string, runStamp: string, agent: string, guideId: string, result: RunResult): string {
  const dir = path.join(outputDir, runStamp);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${agent}-${guideId}.json`);
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  return out;
}

export function writeSuiteSummary(outputDir: string, runStamp: string, summary: SuiteSummary): string {
  const dir = path.join(outputDir, runStamp);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'summary.json');
  fs.writeFileSync(out, JSON.stringify(summary, null, 2));
  return out;
}

export function nowStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
}
