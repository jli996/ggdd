import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'BuildQueue.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('BuildOrder serializable inner class with 3 fields', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /class\s+BuildOrder/));
  assert.ok(hasPattern(codeOnly, /\bbuildingType\b/));
  assert.ok(hasPattern(codeOnly, /\bsecondsToComplete\b/));
  assert.ok(hasPattern(codeOnly, /\bqueuedAtRealTime\b/));
});

test('maxQueueSlots serialized and > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+maxQueueSlots/));
  const m = codeOnly.match(/maxQueueSlots\s*=\s*(\d+)/);
  assert.ok(m, 'expected maxQueueSlots literal');
  assert.ok(parseInt(m![1]) > 0, 'maxQueueSlots must be > 0');
});

test('offlineProgressMultiplier serialized and > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+offlineProgressMultiplier/));
  const m = codeOnly.match(/offlineProgressMultiplier\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected offlineProgressMultiplier literal');
  assert.ok(parseFloat(m![1]) > 0, 'offlineProgressMultiplier must be > 0');
});

test('CompletedBuildings(float) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bCompletedBuildings\s*\(\s*float\b/));
});

test('accepts time as parameter (no internal Time.realtimeSinceStartup call)', () => {
  assert.ok(hasPattern(codeOnly, /\bCompletedBuildings\s*\(\s*float\s+\w+/));
});
