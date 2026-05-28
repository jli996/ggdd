import * as fs from 'node:fs';
import * as path from 'node:path';
import { collectGuides, type CatalogEntry } from '../lib/catalog.ts';
import { cBold, cCyan, cGreen, cRed, cDim } from '../lib/colors.ts';
import { testGrader } from './test-grader.ts';

export interface AuditOptions { verbose?: boolean }
export interface DevOptions { verbose?: boolean }
export interface DevAllOptions { verbose?: boolean; testGraderOnly?: boolean }

interface ArtifactStatus {
  guide: boolean; expectations: boolean; task: boolean;
  demo: boolean; negativeDemo: boolean; grader: boolean;
}

function checkArtifacts(e: CatalogEntry): ArtifactStatus {
  return {
    guide: fs.existsSync(e.guidePath),
    expectations: fs.existsSync(path.join(e.dir, 'expectations.md')),
    task: fs.existsSync(path.join(e.dir, 'tasks', 'task.md')),
    demo: fs.existsSync(path.join(e.dir, 'demo')) && fs.readdirSync(path.join(e.dir, 'demo')).some(f => f.endsWith('.cs')),
    negativeDemo: fs.existsSync(path.join(e.dir, 'negative-demo')) && fs.readdirSync(path.join(e.dir, 'negative-demo')).some(f => f.endsWith('.cs')),
    grader: fs.existsSync(path.join(e.dir, 'grader.ts')),
  };
}

function statusGlyph(b: boolean): string { return b ? cGreen('✓') : cRed('✗'); }

export async function auditGuides(opts: AuditOptions = {}): Promise<boolean> {
  const entries = collectGuides();
  console.log(`\n${cBold(`Audit: ${entries.length} guide(s)`)}\n`);
  console.log(`${cDim('id'.padEnd(40))}  G  E  T  D  N  R`);

  let allOk = true;
  const byCategory = new Map<string, CatalogEntry[]>();
  for (const e of entries) {
    const list = byCategory.get(e.category) ?? [];
    list.push(e); byCategory.set(e.category, list);
  }

  for (const [cat, list] of byCategory) {
    console.log(`\n${cCyan(cat)}`);
    for (const e of list) {
      const s = checkArtifacts(e);
      const ok = s.guide && s.expectations && s.task && s.demo && s.negativeDemo && s.grader;
      if (!ok) allOk = false;
      const cols = [s.guide, s.expectations, s.task, s.demo, s.negativeDemo, s.grader].map(statusGlyph).join('  ');
      console.log(`  ${e.id.padEnd(38)}  ${cols}`);
    }
  }

  console.log();
  return allOk;
}

export async function devGuide(guideDir: string, opts: DevOptions = {}): Promise<boolean> {
  // Plan 3 scope: just run test-grader. The full author loop (gen-negative, gen-grader,
  // guided agent test) is wired up here but only test-grader is required for v1.
  console.log(cBold(`dev ${guideDir}`));
  return await testGrader(guideDir, opts);
}

export async function devAll(opts: DevAllOptions = {}): Promise<boolean> {
  const entries = collectGuides();
  let allOk = true;
  for (const e of entries) {
    const ok = await testGrader(e.dir, { verbose: opts.verbose });
    if (!ok) allOk = false;
  }
  if (allOk) console.log(cGreen(`\nAll ${entries.length} graders calibrated.`));
  else console.error(cRed(`\nCalibration failures found.`));
  return allOk;
}
