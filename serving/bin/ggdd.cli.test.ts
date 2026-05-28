import { test } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, 'ggdd.ts');

function run(args: string[]) {
  return spawnSync('node', ['--experimental-strip-types', CLI, ...args], { encoding: 'utf8' });
}

test('search outputs a JSON array', async () => {
  const r = run(['search', 'keyboard input']);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const parsed = JSON.parse(r.stdout);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.length >= 1);
  assert.equal(typeof parsed[0].id, 'string');
  assert.equal(typeof parsed[0].similarity, 'number');
});

test('search with no query exits 1', () => {
  const r = run(['search']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No search query provided/);
});

test('list outputs a JSON array of catalog entries', () => {
  const r = run(['list']);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const parsed = JSON.parse(r.stdout);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.length >= 1);
  assert.equal(typeof parsed[0].id, 'string');
});

test('retrieve fetches a known guide', () => {
  const r = run(['retrieve', 'new-input-system-basics']);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  assert.match(r.stdout, /--- Guide for new-input-system-basics ---/);
  assert.match(r.stdout, /UnityEngine\.InputSystem/);
});

test('retrieve with multiple ids fetches each', () => {
  const r = run(['retrieve', 'new-input-system-basics,new-input-system-basics']);
  assert.equal(r.status, 0);
  const matches = r.stdout.match(/--- Guide for new-input-system-basics ---/g);
  assert.equal(matches?.length, 2);
});

test('retrieve unknown id exits 1', () => {
  const r = run(['retrieve', 'does-not-exist']);
  assert.equal(r.status, 1);
});

test('retrieve with no ids exits 1', () => {
  const r = run(['retrieve']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No IDs provided/);
});
