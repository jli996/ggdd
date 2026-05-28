import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'BuildOrderScout.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('scoutWindowSeconds serialized in [15, 60]', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+scoutWindowSeconds/));
  const m = codeOnly.match(/scoutWindowSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected scoutWindowSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 15 && v <= 60, `scoutWindowSeconds ${v} not in [15, 60]`);
});

test('BuildingArchetype enum with at least 4 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'BuildingArchetype'));
  const m = codeOnly.match(/enum\s+BuildingArchetype\s*\{([^}]+)\}/);
  assert.ok(m, 'expected BuildingArchetype enum body');
  const values = m![1].split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 4, `expected >= 4 BuildingArchetype values, got ${values.length}`);
});

test('IdentifyStrategy takes BuildingArchetype[]', () => {
  assert.ok(hasPattern(codeOnly, /\bIdentifyStrategy\s*\(\s*BuildingArchetype\s*\[\s*\]/));
});

test('BuildingArchetype referenced multiple times', () => {
  const matches = codeOnly.match(/\bBuildingArchetype\b/g) ?? [];
  assert.ok(matches.length >= 3, `expected BuildingArchetype referenced >= 3 times, got ${matches.length}`);
});

test('method returns a BuildingArchetype value', () => {
  assert.ok(hasPattern(codeOnly, /BuildingArchetype\s+\w+\s*\(|return\s+\w*BuildingArchetype\b|return\s+dominant\b/));
});
