import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ColorSortLevelGenerator.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('scrambleStepCount serialized int > 10', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+scrambleStepCount/));
  const m = codeOnly.match(/scrambleStepCount\s*=\s*(\d+)/);
  assert.ok(m, 'expected scrambleStepCount literal');
  const v = parseInt(m![1]);
  assert.ok(v > 10, `scrambleStepCount ${v} must be > 10`);
});

test('randomSeed serialized for reproducibility', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+randomSeed\b/));
  assert.ok(hasPattern(codeOnly, /randomSeed/));
});

test('extraEmptyBottles serialized int >= 1', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+extraEmptyBottles\b/));
  const m = codeOnly.match(/extraEmptyBottles\s*=\s*(\d+)/);
  assert.ok(m, 'expected extraEmptyBottles literal');
  const v = parseInt(m![1]);
  assert.ok(v >= 1, `extraEmptyBottles ${v} must be >= 1`);
});

test('Generate method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bGenerate\s*\(/));
});

test('EnsuredSolvable returns true', () => {
  assert.ok(hasPattern(codeOnly, /\bEnsuredSolvable\s*\(/));
  assert.ok(hasPattern(codeOnly, /return\s+true/));
});
