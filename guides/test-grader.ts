import * as fs from 'node:fs';
import * as path from 'node:path';
import { runGrader } from './run-grader.ts';
import { cGreen, cRed, cDim } from '../lib/colors.ts';

export interface TestGraderOptions {
  verbose?: boolean;
}

/** Returns true iff demo passes (fail===0) AND negative-demo fails at least one assertion. */
export async function testGrader(guideDir: string, opts: TestGraderOptions = {}): Promise<boolean> {
  const demoDir = path.join(guideDir, 'demo');
  const negDir = path.join(guideDir, 'negative-demo');
  if (!fs.existsSync(demoDir)) { console.error(cRed(`${guideDir}: missing demo/`)); return false; }
  if (!fs.existsSync(negDir)) { console.error(cRed(`${guideDir}: missing negative-demo/`)); return false; }

  // Pick the first .cs file in demo and negative-demo as the target.
  const demoTarget = firstCs(demoDir);
  const negTarget = firstCs(negDir);
  if (!demoTarget) { console.error(cRed(`${guideDir}: no .cs file under demo/`)); return false; }
  if (!negTarget) { console.error(cRed(`${guideDir}: no .cs file under negative-demo/`)); return false; }

  const demoRes = await runGrader(guideDir, { target: demoTarget });
  const negRes = await runGrader(guideDir, { target: negTarget });

  const demoOk = demoRes.fail === 0 && demoRes.pass > 0;
  const negOk = negRes.fail >= 1;
  const ok = demoOk && negOk;

  const label = path.relative(process.cwd(), guideDir);
  if (ok) console.log(`${cGreen('✓')} ${label}  ${cDim(`demo ${demoRes.pass}/${demoRes.pass + demoRes.fail}, negative ${negRes.fail} fail`)}`);
  else {
    console.error(`${cRed('✗')} ${label}`);
    if (!demoOk) console.error(`    demo expected all pass, got ${demoRes.pass}/${demoRes.pass + demoRes.fail}`);
    if (!negOk) console.error(`    negative-demo expected ≥1 fail, got 0`);
    if (opts.verbose) {
      console.error(`    --- demo stdout ---\n${demoRes.stdout}`);
      console.error(`    --- negative stdout ---\n${negRes.stdout}`);
    }
  }
  return ok;
}

function firstCs(dir: string): string | null {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.cs')) return path.join(dir, entry.name);
  }
  return null;
}
