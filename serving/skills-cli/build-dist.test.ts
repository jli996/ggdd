import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDist } from './build-dist.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVING = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(SERVING, 'build');

test('buildDist produces ggdd.js and mcp-server.js in serving/build/', async () => {
  if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true });
  await buildDist();
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'ggdd.js')));
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'mcp-server.js')));
});

test('bundled ggdd.js has a shebang line', () => {
  const src = fs.readFileSync(path.join(BUILD_DIR, 'ggdd.js'), 'utf8');
  assert.match(src.split('\n')[0], /^#!/);
});
