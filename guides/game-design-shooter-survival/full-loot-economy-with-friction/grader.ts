import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LootDecay.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares a decayPerUse serialized field in (0, 0.5]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*decay\w*\s*=\s*(\d+(?:\.\d+)?)f?/i);
  assert.ok(m, 'expected a [SerializeField] float for decay');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 0.5, `decay default ${v} not in (0, 0.5]`);
});

test('declares a vault cap serialized int', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+\w*[Vv]ault\w*/));
});

test('declares raid window fields', () => {
  assert.ok(hasPattern(codeOnly, /\braidWindow\w*\b/i));
});

test('ApplyDurabilityLoss exists and clamps to >= 0', () => {
  assert.ok(hasPattern(codeOnly, /\bApplyDurabilityLoss\s*\(/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Max\s*\(\s*0f?\s*,/));
});

test('CanAddToVault exists', () => {
  assert.ok(hasPattern(codeOnly, /\bCanAddToVault\s*\(/));
});

test('IsRaidWindowOpen exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsRaidWindowOpen\s*\(/));
});
