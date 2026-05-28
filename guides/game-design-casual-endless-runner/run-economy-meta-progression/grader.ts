import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RunEconomy.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('ScriptableObject with [CreateAssetMenu]', () => {
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu/));
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject\b/));
});

test('UnlockType enum with ≥3 values', () => {
  assert.ok(hasPattern(codeOnly, /\benum\s+UnlockType\b/));
  const enumMatch = codeOnly.match(/enum\s+UnlockType\s*\{([^}]+)\}/);
  assert.ok(enumMatch, 'UnlockType enum body must exist');
  const members = enumMatch![1].split(',').filter(s => s.trim().length > 0);
  assert.ok(members.length >= 3, `UnlockType enum needs ≥3 values, found ${members.length}`);
});

test('failureCoinKeepPercent > 0 (player keeps something on failure)', () => {
  assert.ok(hasPattern(codeOnly, /\bfailureCoinKeepPercent\b/));
  const match = codeOnly.match(/failureCoinKeepPercent\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'failureCoinKeepPercent must have a numeric default');
  assert.ok(parseFloat(match![1]) > 0, `failureCoinKeepPercent must be > 0, got ${match![1]}`);
});

test('Unlockable serializable inner class exists', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(declaresType(codeOnly, 'class', 'Unlockable'));
});

test('CoinsEarned(float, bool) references failureCoinKeepPercent', () => {
  assert.ok(hasPattern(codeOnly, /\bCoinsEarned\s*\(\s*float\b[\s\S]*?,\s*bool\b/));
  assert.ok(hasPattern(codeOnly, /CoinsEarned[\s\S]{0,400}failureCoinKeepPercent/));
});
