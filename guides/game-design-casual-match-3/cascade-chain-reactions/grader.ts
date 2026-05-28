import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'MatchCascade.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('maxChainLength is serialized and in [4, 20]', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+maxChainLength/));
  const m = codeOnly.match(/maxChainLength\s*=\s*(\d+)/);
  assert.ok(m, 'expected maxChainLength literal');
  const v = parseInt(m![1]);
  assert.ok(v >= 4 && v <= 20, `maxChainLength ${v} not in [4, 20]`);
});

test('chainBonusMultiplier is serialized and > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+chainBonusMultiplier/));
  const m = codeOnly.match(/chainBonusMultiplier\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected chainBonusMultiplier literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0, `chainBonusMultiplier ${v} must be > 0`);
});

test('ScoreForChainStep method exists with (int, int) parameters', () => {
  assert.ok(hasPattern(codeOnly, /\bScoreForChainStep\s*\(\s*int\b[\s\S]*?,\s*int\b/));
});

test('ShouldAbortChain method exists and returns bool', () => {
  assert.ok(hasPattern(codeOnly, /\bbool\b[\s\S]*?\bShouldAbortChain\s*\(/));
});

test('ScoreForChainStep references chainIndex in scoring math', () => {
  assert.ok(hasPattern(codeOnly, /chainIndex/));
});
