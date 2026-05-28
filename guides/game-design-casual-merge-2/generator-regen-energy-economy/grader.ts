import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'Generator.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('energyPerItemCost serialized field > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+energyPerItemCost/));
  const m = codeOnly.match(/energyPerItemCost\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected energyPerItemCost literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0, `energyPerItemCost ${v} must be > 0`);
});

test('energyRegenSecondsPerUnit in [60, 600]', () => {
  assert.ok(hasPattern(codeOnly, /\bfloat\s+energyRegenSecondsPerUnit\b/));
  const m = codeOnly.match(/energyRegenSecondsPerUnit\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected energyRegenSecondsPerUnit literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 60 && v <= 600, `energyRegenSecondsPerUnit ${v} not in [60, 600]`);
});

test('energyMaxCap serialized int > 0', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+energyMaxCap\b/));
  const m = codeOnly.match(/energyMaxCap\s*=\s*(\d+)/);
  assert.ok(m, 'expected energyMaxCap literal');
  const v = parseInt(m![1]);
  assert.ok(v > 0, `energyMaxCap ${v} must be > 0`);
});

test('CurrentEnergy method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bCurrentEnergy\s*\(/));
});

test('TrySpawnItem takes out float parameter', () => {
  assert.ok(hasPattern(codeOnly, /\bTrySpawnItem\s*\(\s*out\s+float\b/));
});
