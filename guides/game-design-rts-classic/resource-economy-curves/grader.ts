import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RtsEconomy.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('mineralsPerWorkerPerSecond is serialized and in range (0, 5)', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+mineralsPerWorkerPerSecond/));
  const m = codeOnly.match(/mineralsPerWorkerPerSecond\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected mineralsPerWorkerPerSecond literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v < 5, `mineralsPerWorkerPerSecond ${v} not in (0, 5)`);
});

test('workersCapPerExpansion is serialized and > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+workersCapPerExpansion/));
  const m = codeOnly.match(/workersCapPerExpansion\s*=\s*(\d+)/);
  assert.ok(m, 'expected workersCapPerExpansion literal');
  const v = parseInt(m![1]);
  assert.ok(v > 0, `workersCapPerExpansion ${v} must be > 0`);
});

test('expansionCostScaling is > 1.0 to enforce exponential scaling', () => {
  const m = codeOnly.match(/expansionCostScaling\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected expansionCostScaling literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 1.0, `expansionCostScaling ${v} must be > 1.0`);
});

test('EconomicCapacity method exists with (int, int) parameters', () => {
  assert.ok(hasPattern(codeOnly, /\bEconomicCapacity\s*\(\s*int\b[\s\S]*?,\s*int\b/));
});

test('ExpansionCost method exists and uses Mathf.Pow', () => {
  assert.ok(hasPattern(codeOnly, /\bExpansionCost\s*\(\s*int\b/));
  assert.ok(hasPattern(codeOnly, /\bMathf\.Pow\s*\(/));
});
