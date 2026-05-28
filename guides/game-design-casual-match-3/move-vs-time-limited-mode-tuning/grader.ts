import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LevelMode.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('ScriptableObject with [CreateAssetMenu]', () => {
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu/));
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject/));
});

test('ModeType enum has both MoveLimited and TimeLimited', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'ModeType'));
  assert.ok(hasPattern(codeOnly, /\bMoveLimited\b/));
  assert.ok(hasPattern(codeOnly, /\bTimeLimited\b/));
});

test('ObjectiveType enum has at least 3 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'ObjectiveType'));
  const m = codeOnly.match(/enum\s+ObjectiveType\s*\{([^}]+)\}/);
  assert.ok(m, 'expected ObjectiveType enum body');
  const values = m![1].split(',').filter(v => v.trim().length > 0);
  assert.ok(values.length >= 3, `ObjectiveType has ${values.length} values, expected >= 3`);
});

test('Both moveCount and timeLimitSeconds serialized fields are present', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+moveCount\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+timeLimitSeconds\b/));
});

test('BudgetLabel method exists and references both fields', () => {
  assert.ok(hasPattern(codeOnly, /\bBudgetLabel\s*\(/));
  assert.ok(hasPattern(codeOnly, /moveCount/));
  assert.ok(hasPattern(codeOnly, /timeLimitSeconds/));
});
