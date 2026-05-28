import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ClanSystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('ScriptableObject with [CreateAssetMenu]', () => {
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu/));
  assert.ok(hasPattern(codeOnly, /ScriptableObject/));
});

test('soloProgressionCap < clanMaxLevel', () => {
  const soloM = codeOnly.match(/soloProgressionCap\s*=\s*(\d+)/);
  const clanM = codeOnly.match(/clanMaxLevel\s*=\s*(\d+)/);
  assert.ok(soloM, 'expected soloProgressionCap literal');
  assert.ok(clanM, 'expected clanMaxLevel literal');
  assert.ok(parseInt(soloM![1]) < parseInt(clanM![1]), 'soloProgressionCap must be < clanMaxLevel');
});

test('ClanBonus is a serializable inner class', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /class\s+ClanBonus/));
  assert.ok(hasPattern(codeOnly, /\bclanSize\b/));
  assert.ok(hasPattern(codeOnly, /\bbonusMultiplier\b/));
});

test('bonuses array field is serialized', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?ClanBonus\s*\[\s*\]\s+bonuses/));
});

test('MaxAchievableLevel(bool) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bMaxAchievableLevel\s*\(\s*bool\b/));
});
