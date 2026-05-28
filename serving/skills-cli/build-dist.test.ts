import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDist } from './build-dist.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVING = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(SERVING, 'build');

test('buildDist produces a self-contained build/ directory', async () => {
  if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true });
  await buildDist();
  for (const f of ['ggdd.js', 'mcp-server.js', 'use-cases.gen.ts', 'embeddings.gen.bin', 'SKILL.md', 'plugin.json', 'skill-version.txt', 'megaskill.md']) {
    assert.ok(fs.existsSync(path.join(BUILD_DIR, f)), `missing ${f}`);
  }
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'tfjs_model_minilm', 'model.json')), 'missing model.json');
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'tfjs_model_minilm', 'group1-shard1of1.bin')), 'missing model weights');
});

test('bundled ggdd.js has the node shebang', () => {
  const src = fs.readFileSync(path.join(BUILD_DIR, 'ggdd.js'), 'utf8');
  assert.match(src.split('\n')[0], /^#!\/usr\/bin\/env node/);
});

test('bundled ggdd.js is executable + reports the right version', async () => {
  const { execFileSync } = await import('node:child_process');
  const stat = fs.statSync(path.join(BUILD_DIR, 'ggdd.js'));
  assert.equal(stat.mode & 0o111, 0o111);
  const out = execFileSync(path.join(BUILD_DIR, 'ggdd.js'), ['--version'], { encoding: 'utf8' }).trim();
  assert.match(out, /^\d+\.\d+\.\d+/);
});
