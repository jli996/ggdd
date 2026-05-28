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

import * as fs from 'node:fs';
import * as os from 'node:os';

function runWithSkillsStub(args: string[], stubScript: string) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ggdd-cli-'));
  const stub = path.join(tmp, 'fake-npx');
  fs.writeFileSync(stub, stubScript, { mode: 0o755 });
  return spawnSync('node', ['--experimental-strip-types', CLI, ...args], {
    encoding: 'utf8',
    env: { ...process.env, GGDD_SKILLS_SPAWN_OVERRIDE: stub },
  });
}

test('install shells out to the spawn override', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['install'], stub);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /INVOKED:.*skills add/);
});

test('install --choose passes interactive mode', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['install', '--choose'], stub);
  assert.equal(r.status, 0);
  // No --skill ggdd suffix when --choose is set
  assert.doesNotMatch(r.stdout, /--skill ggdd/);
});

test('install propagates non-zero exit from skills tool', () => {
  const stub = `#!/usr/bin/env bash\necho "fail" >&2\nexit 5\n`;
  const r = runWithSkillsStub(['install'], stub);
  assert.equal(r.status, 5);
});

test('uninstall shells out', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['uninstall'], stub);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /INVOKED:.*skills remove/);
});

test('update shells out', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['update'], stub);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /INVOKED:.*skills update/);
});

test('--skill-version with a fresh version emits no warning', () => {
  const r = run(['--skill-version', '2026_05_27_v1', 'list']);
  assert.equal(r.status, 0);
  assert.equal(r.stderr.trim(), '');
});

test('--skill-version older than 5 days emits a warning', () => {
  // Use a date guaranteed to be >5 days behind today.
  const r = run(['--skill-version', '2020_01_01_v1', 'list']);
  assert.equal(r.status, 0);
  assert.match(r.stderr, /new SKILL\.md is available/);
});

test('--skill-version older than 60 days emits the escalated warning', () => {
  const r = run(['--skill-version', '2020_01_01_v1', 'list']);
  assert.equal(r.status, 0);
  assert.match(r.stderr, /PROBLEM DETECTED/);
});
