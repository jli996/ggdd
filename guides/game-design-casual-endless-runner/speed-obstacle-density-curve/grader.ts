import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RunnerDifficulty.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('baseSpeed > 0', () => {
  assert.ok(hasPattern(codeOnly, /\bbaseSpeed\b/));
  const match = codeOnly.match(/baseSpeed\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'baseSpeed must have a numeric default');
  assert.ok(parseFloat(match![1]) > 0, `baseSpeed must be > 0, got ${match![1]}`);
});

test('speedIncreasePerMinute > 0', () => {
  assert.ok(hasPattern(codeOnly, /\bspeedIncreasePerMinute\b/));
  const match = codeOnly.match(/speedIncreasePerMinute\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'speedIncreasePerMinute must have a numeric default');
  assert.ok(parseFloat(match![1]) > 0, `speedIncreasePerMinute must be > 0, got ${match![1]}`);
});

test('maxSpeed > baseSpeed (cap is meaningful)', () => {
  const maxMatch  = codeOnly.match(/maxSpeed\s*=\s*([\d.]+)f?/);
  const baseMatch = codeOnly.match(/baseSpeed\s*=\s*([\d.]+)f?/);
  assert.ok(maxMatch,  'maxSpeed must have a numeric default');
  assert.ok(baseMatch, 'baseSpeed must have a numeric default');
  assert.ok(
    parseFloat(maxMatch![1]) > parseFloat(baseMatch![1]),
    `maxSpeed (${maxMatch![1]}) must be > baseSpeed (${baseMatch![1]})`
  );
});

test('SpeedAt uses Mathf.Min for cap', () => {
  assert.ok(hasPattern(codeOnly, /\bSpeedAt\b/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Min/));
});

test('ObstacleDensityAt method exists and references AnimationCurve', () => {
  assert.ok(hasPattern(codeOnly, /\bObstacleDensityAt\b/));
  assert.ok(hasPattern(codeOnly, /\bAnimationCurve\b/));
});
