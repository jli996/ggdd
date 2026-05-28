import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ColorSortDifficulty.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('ScriptableObject with [CreateAssetMenu]', () => {
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu/));
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject/));
});

test('LevelDifficulty serializable inner class with 4 fields', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(declaresType(codeOnly, 'class', 'LevelDifficulty'));
  assert.ok(hasPattern(codeOnly, /\blevelNumber\b/));
  assert.ok(hasPattern(codeOnly, /\bcolorCount\b/));
  assert.ok(hasPattern(codeOnly, /\bbottleCount\b/));
  assert.ok(hasPattern(codeOnly, /\bextraEmpty\b/));
});

test('levels array field exists', () => {
  assert.ok(hasPattern(codeOnly, /LevelDifficulty\s*\[\s*\]\s+levels\b/));
});

test('IsValidProgression method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsValidProgression\s*\(/));
});

test('IsValidProgression body references levels.Length in a loop', () => {
  assert.ok(hasPattern(codeOnly, /levels\.Length/));
  assert.ok(hasPattern(codeOnly, /\bfor\s*\(/));
});
