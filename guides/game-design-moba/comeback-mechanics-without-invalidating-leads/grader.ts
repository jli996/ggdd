import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ComebackMechanic.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('all 4 serialized scaling fields present', () => {
  assert.ok(hasPattern(codeOnly, /\bbaseBountyGold\b/));
  assert.ok(hasPattern(codeOnly, /\bbountyScalingPerKgoldDeficit\b/));
  assert.ok(hasPattern(codeOnly, /\bmaxBountyGold\b/));
  assert.ok(hasPattern(codeOnly, /\bneutralObjectiveBoostMaxPercent\b/));
});

test('maxBountyGold default > baseBountyGold default', () => {
  const baseM = codeOnly.match(/baseBountyGold\s*=\s*(\d+(?:\.\d+)?)f?/);
  const maxM  = codeOnly.match(/maxBountyGold\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(baseM, 'expected baseBountyGold literal');
  assert.ok(maxM,  'expected maxBountyGold literal');
  assert.ok(parseFloat(maxM![1]) > parseFloat(baseM![1]), 'maxBountyGold must be > baseBountyGold');
});

test('neutralObjectiveBoostMaxPercent in (0, 0.5]', () => {
  const m = codeOnly.match(/neutralObjectiveBoostMaxPercent\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected neutralObjectiveBoostMaxPercent literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 0.5, `neutralObjectiveBoostMaxPercent ${v} not in (0, 0.5]`);
});

test('BountyForKill(float, float) uses Mathf.Min', () => {
  assert.ok(hasPattern(codeOnly, /\bBountyForKill\s*\(\s*float\b[\s\S]*?,\s*float\b/));
  assert.ok(hasPattern(codeOnly, /\bMathf\.Min\s*\(/));
});

test('bountyScalingPerKgoldDeficit referenced in method body', () => {
  assert.ok(hasPattern(codeOnly, /\bbountyScalingPerKgoldDeficit\b[\s\S]*?\bBountyForKill\b|\bBountyForKill\b[\s\S]*?\bbountyScalingPerKgoldDeficit\b/));
});
