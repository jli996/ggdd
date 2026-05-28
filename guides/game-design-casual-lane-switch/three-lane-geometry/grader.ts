import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LaneController.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('laneCount = 3 literal (design requires exactly 3)', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+laneCount\s*=\s*3\b/));
});

test('laneWidthMeters serialized float in [1.5, 4.0]', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+laneWidthMeters/));
  const m = codeOnly.match(/laneWidthMeters\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected laneWidthMeters literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 1.5 && v <= 4.0, `laneWidthMeters ${v} not in [1.5, 4.0]`);
});

test('swipeMinDistancePx serialized float > 0', () => {
  assert.ok(hasPattern(codeOnly, /\bfloat\s+swipeMinDistancePx\b/));
  const m = codeOnly.match(/swipeMinDistancePx\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected swipeMinDistancePx literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0, `swipeMinDistancePx ${v} must be > 0`);
});

test('OnSwipe(float) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bOnSwipe\s*\(\s*float\b/));
});

test('IsValidLaneCount method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsValidLaneCount\s*\(/));
});
