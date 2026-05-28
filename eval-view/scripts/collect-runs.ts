import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVAL_VIEW = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(EVAL_VIEW, '..');
const HARNESS_RUNS = path.join(REPO_ROOT, 'harness', 'runs');
const PUBLIC_DATA = path.join(EVAL_VIEW, 'public', 'data');

function copyDirRecursive(src: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main(): void {
  // Wipe + recreate
  if (fs.existsSync(PUBLIC_DATA)) fs.rmSync(PUBLIC_DATA, { recursive: true });
  fs.mkdirSync(PUBLIC_DATA, { recursive: true });

  if (!fs.existsSync(HARNESS_RUNS)) {
    console.log(`No runs at ${HARNESS_RUNS}; writing empty index.json`);
    fs.writeFileSync(path.join(PUBLIC_DATA, 'index.json'), JSON.stringify({ stamps: [] }));
    return;
  }

  // Build an index of available stamps + per-stamp file lists.
  const stamps = fs.readdirSync(HARNESS_RUNS).filter(s => fs.statSync(path.join(HARNESS_RUNS, s)).isDirectory()).sort();
  const index: { stamps: Array<{ stamp: string; files: string[] }> } = { stamps: [] };
  for (const stamp of stamps) {
    const stampDir = path.join(HARNESS_RUNS, stamp);
    const outDir = path.join(PUBLIC_DATA, stamp);
    copyDirRecursive(stampDir, outDir);
    const files = fs.readdirSync(stampDir).filter(f => f.endsWith('.json'));
    index.stamps.push({ stamp, files });
  }
  fs.writeFileSync(path.join(PUBLIC_DATA, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`Collected ${stamps.length} run(s) into ${PUBLIC_DATA}`);
}

main();
