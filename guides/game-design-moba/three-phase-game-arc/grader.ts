import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'MobaPhases.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('GamePhase enum with exactly 3 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'GamePhase'));
  const m = codeOnly.match(/enum\s+GamePhase\s*\{([^}]+)\}/);
  assert.ok(m, 'expected GamePhase enum body');
  const values = m![1].split(',').map(s => s.trim()).filter(Boolean);
  assert.strictEqual(values.length, 3, `expected exactly 3 GamePhase values, got ${values.length}`);
});

test('ChampionPowerCurve is a serializable inner class', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /class\s+ChampionPowerCurve/));
});

test('ChampionPowerCurve has lanePower, midPower, latePower fields', () => {
  assert.ok(hasPattern(codeOnly, /\blanePower\b/));
  assert.ok(hasPattern(codeOnly, /\bmidPower\b/));
  assert.ok(hasPattern(codeOnly, /\blatePower\b/));
});

test('champions array field is serialized', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?ChampionPowerCurve\s*\[\s*\]\s+champions/));
});

test('PowerInPhase and PeakPhase methods exist', () => {
  assert.ok(hasPattern(codeOnly, /\bPowerInPhase\s*\(\s*string\b/));
  assert.ok(hasPattern(codeOnly, /\bPeakPhase\s*\(\s*string\b/));
});
