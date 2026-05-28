import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PrestigeSystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('perTierProductionMultiplier > 1 (exponential growth required)', () => {
  // Field must exist and its literal value must be > 1
  assert.ok(hasPattern(codeOnly, /\bperTierProductionMultiplier\b/));
  // Default value should be a number > 1 (e.g. 2f, 1.5f, 3f)
  const match = codeOnly.match(/perTierProductionMultiplier\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'perTierProductionMultiplier must have a numeric default');
  assert.ok(parseFloat(match![1]) > 1, 'perTierProductionMultiplier must be > 1');
});

test('prestigeBoostPerPoint > 0', () => {
  assert.ok(hasPattern(codeOnly, /\bprestigeBoostPerPoint\b/));
  const match = codeOnly.match(/prestigeBoostPerPoint\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'prestigeBoostPerPoint must have a numeric default');
  assert.ok(parseFloat(match![1]) > 0, 'prestigeBoostPerPoint must be > 0');
});

test('ProductionAtTier uses Mathf.Pow', () => {
  assert.ok(hasPattern(codeOnly, /\bProductionAtTier\b/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Pow/));
});

test('PrestigePointsEarned method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bPrestigePointsEarned\b/));
});

test('ProductionAtTier takes (int, int) parameters', () => {
  assert.ok(hasPattern(codeOnly, /ProductionAtTier\s*\(\s*int\b[\s\S]*?,\s*int\b/));
});
