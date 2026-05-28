import * as fs from 'node:fs';
import * as path from 'node:path';
import { summarize, type RunResult } from './lib/metrics.ts';
import { writeSuiteSummary } from './lib/reporting.ts';
import { resolveSuiteConfig } from './config.ts';

export async function backfill(): Promise<void> {
  const cfg = await resolveSuiteConfig();
  if (!fs.existsSync(cfg.outputDir)) { console.error(`No runs dir: ${cfg.outputDir}`); return; }
  for (const stamp of fs.readdirSync(cfg.outputDir)) {
    const stampDir = path.join(cfg.outputDir, stamp);
    if (!fs.statSync(stampDir).isDirectory()) continue;
    const runs: RunResult[] = [];
    for (const f of fs.readdirSync(stampDir)) {
      if (!f.endsWith('.json') || f === 'summary.json') continue;
      runs.push(JSON.parse(fs.readFileSync(path.join(stampDir, f), 'utf8')));
    }
    if (runs.length === 0) continue;
    writeSuiteSummary(cfg.outputDir, stamp, summarize(runs));
    console.log(`  ${stamp}: re-summarized ${runs.length} runs`);
  }
}
