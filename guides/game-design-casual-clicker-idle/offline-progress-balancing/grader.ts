import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'OfflineProgress.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('offlineProductionMultiplier in (0, 1) — offline must be less than online', () => {
  assert.ok(hasPattern(codeOnly, /\bofflineProductionMultiplier\b/));
  const match = codeOnly.match(/offlineProductionMultiplier\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'offlineProductionMultiplier must have a numeric default');
  const val = parseFloat(match![1]);
  assert.ok(val > 0 && val < 1, `offlineProductionMultiplier must be in (0,1), got ${val}`);
});

test('maxOfflineHours in [1, 48]', () => {
  assert.ok(hasPattern(codeOnly, /\bmaxOfflineHours\b/));
  const match = codeOnly.match(/maxOfflineHours\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'maxOfflineHours must have a numeric default');
  const val = parseFloat(match![1]);
  assert.ok(val >= 1 && val <= 48, `maxOfflineHours must be in [1,48], got ${val}`);
});

test('OfflineEarnings(float, float) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bOfflineEarnings\s*\(\s*float\b[\s\S]*?,\s*float\b/));
});

test('OfflineEarnings uses Mathf.Min for the time cap', () => {
  assert.ok(hasPattern(codeOnly, /Mathf\.Min/));
});

test('OfflineEarnings body references offlineProductionMultiplier', () => {
  assert.ok(hasPattern(codeOnly, /offlineProductionMultiplier/));
});
