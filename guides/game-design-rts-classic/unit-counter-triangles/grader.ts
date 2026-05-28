import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'UnitCounters.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('UnitType enum with at least 4 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'UnitType'));
  const m = codeOnly.match(/enum\s+UnitType\s*\{([^}]+)\}/);
  assert.ok(m, 'expected UnitType enum body');
  const values = m![1].split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 4, `expected >= 4 UnitType values, got ${values.length}`);
});

test('CounterRelation serializable inner class with 3 fields', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /class\s+CounterRelation/));
  assert.ok(hasPattern(codeOnly, /\battacker\b/));
  assert.ok(hasPattern(codeOnly, /\bvictim\b/));
  assert.ok(hasPattern(codeOnly, /\bdamageMultiplier\b/));
});

test('relations array field is serialized', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?CounterRelation\s*\[\s*\]\s+relations/));
});

test('DamageMultiplier(UnitType, UnitType) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bDamageMultiplier\s*\(\s*UnitType\b[\s\S]*?,\s*UnitType\b/));
});

test('default fallback returns 1.0', () => {
  assert.ok(hasPattern(codeOnly, /return\s+1\.0f?/));
});
