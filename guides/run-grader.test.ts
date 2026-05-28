import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { runGrader } from './run-grader.ts';
import { rootDir } from '../lib/paths.ts';

const NEW_INPUT = path.join(rootDir, 'guides', 'unity-engine', 'new-input-system-basics');

test('runGrader returns pass count for a known-good demo', async () => {
  const res = await runGrader(NEW_INPUT);
  assert.ok(res.pass >= 1, `expected pass >= 1, got ${res.pass}`);
  assert.equal(res.fail, 0);
});

test('runGrader fails when pointed at the negative-demo via TARGET_FILE', async () => {
  const neg = path.join(NEW_INPUT, 'negative-demo', 'PlayerController.cs');
  const res = await runGrader(NEW_INPUT, { target: neg });
  assert.ok(res.fail >= 1, `expected fail >= 1, got ${res.fail}`);
});

test('runGrader throws if the guide dir has no grader.ts', async () => {
  await assert.rejects(() => runGrader('/tmp/does-not-exist-xyz'));
});

test('runGrader returns perAssertion array with named entries', async () => {
  const res = await runGrader(path.join(rootDir, 'guides', 'unity-engine', 'new-input-system-basics'));
  assert.ok(Array.isArray(res.perAssertion));
  assert.ok(res.perAssertion.length >= 1, `expected perAssertion entries, got ${res.perAssertion.length}`);
  assert.ok(res.perAssertion.every(a => typeof a.name === 'string' && typeof a.passed === 'boolean'));
});
