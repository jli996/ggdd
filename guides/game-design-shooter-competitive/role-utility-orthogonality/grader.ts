import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'AgentClass.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares UtilityCategory enum with ≥5 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'UtilityCategory'));
  const m = codeOnly.match(/enum\s+UtilityCategory\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 UtilityCategory values, got ${values.length}: ${values.join(', ')}`);
});

test('AgentClass extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /AgentClass\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares utilityCategories as UtilityCategory[]', () => {
  assert.ok(hasPattern(codeOnly, /\bUtilityCategory\[\]\s+utilityCategories\b/));
});

test('has weaponDamage field', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+weaponDamage\b/));
});

test('has moveSpeed field', () => {
  assert.ok(hasPattern(codeOnly, /\bfloat\s+moveSpeed\b/));
});
