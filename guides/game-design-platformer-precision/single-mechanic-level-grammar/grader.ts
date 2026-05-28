import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LevelGrammar.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('LevelGrammar extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /LevelGrammar\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares PlatformerMechanic enum with ≥5 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'PlatformerMechanic'));
  const m = codeOnly.match(/enum\s+PlatformerMechanic\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 mechanics, got ${values.length}`);
});

test('declares LevelSpec serializable inner class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'LevelSpec'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+levelName\b/));
  assert.ok(hasPattern(codeOnly, /\bPlatformerMechanic\[\]\s+knownMechanics\b/));
  assert.ok(hasPattern(codeOnly, /\bPlatformerMechanic\[\]\s+newMechanicsIntroduced\b/));
});

test('declares levels array field', () => {
  assert.ok(hasPattern(codeOnly, /\bLevelSpec\[\]\s+levels\b/));
});

test('IsValidGrammar method exists and checks length > 1', () => {
  assert.ok(hasPattern(codeOnly, /\bIsValidGrammar\s*\(/));
  assert.ok(hasPattern(codeOnly, /newMechanicsIntroduced\.Length\s*>\s*1/));
});
