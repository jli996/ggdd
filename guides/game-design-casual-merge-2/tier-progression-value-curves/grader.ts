import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'MergeTierProgression.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('ScriptableObject with [CreateAssetMenu]', () => {
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu/));
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject/));
});

test('maxTier serialized int > 5', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+maxTier\b/));
  const m = codeOnly.match(/maxTier\s*=\s*(\d+)/);
  assert.ok(m, 'expected maxTier literal');
  const v = parseInt(m![1]);
  assert.ok(v > 5, `maxTier ${v} must be > 5`);
});

test('perTierValueMultiplier > 2 (exponential, not linear)', () => {
  assert.ok(hasPattern(codeOnly, /\bfloat\s+perTierValueMultiplier\b/));
  const m = codeOnly.match(/perTierValueMultiplier\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected perTierValueMultiplier literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 2, `perTierValueMultiplier ${v} must be > 2 for exponential growth`);
});

test('ValueForTier uses Mathf.Pow', () => {
  assert.ok(hasPattern(codeOnly, /\bValueForTier\s*\(\s*int\b/));
  assert.ok(hasPattern(codeOnly, /\bMathf\.Pow\s*\(/));
});

test('TierFromMergeCount method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bTierFromMergeCount\s*\(\s*int\b/));
});
