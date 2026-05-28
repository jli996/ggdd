import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'CrowdFormation.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('FormationShape enum with at least 3 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'FormationShape'));
  const m = codeOnly.match(/enum\s+FormationShape\s*\{([^}]+)\}/);
  assert.ok(m, 'expected FormationShape enum body');
  const values = m![1].split(',').filter(v => v.trim().length > 0);
  assert.ok(values.length >= 3, `FormationShape has ${values.length} values, expected >= 3`);
});

test('unitSpacingMeters serialized float > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+unitSpacingMeters/));
  const m = codeOnly.match(/unitSpacingMeters\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected unitSpacingMeters literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0, `unitSpacingMeters ${v} must be > 0`);
});

test('AddUnits(int) and RemoveUnits(int) methods exist', () => {
  assert.ok(hasPattern(codeOnly, /\bAddUnits\s*\(\s*int\b/));
  assert.ok(hasPattern(codeOnly, /\bRemoveUnits\s*\(\s*int\b/));
});

test('LayoutPositions returns Vector3 array', () => {
  assert.ok(hasPattern(codeOnly, /\bVector3\s*\[\s*\][\s\S]*?\bLayoutPositions\s*\(|LayoutPositions\s*\([\s\S]*?\bVector3\s*\[\s*\]/));
});

test('LayoutPositions references formation field', () => {
  assert.ok(hasPattern(codeOnly, /\bformation\b/));
});
