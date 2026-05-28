import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'WorldStructure.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('WorldStructure extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /WorldStructure\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares PlayerAbility enum with ≥5 values including None', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'PlayerAbility'));
  const m = codeOnly.match(/enum\s+PlayerAbility\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 PlayerAbility values, got ${values.length}`);
  assert.ok(values.some(v => v === 'None'), 'expected None sentinel in PlayerAbility enum');
});

test('declares SubWorld serializable inner class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'SubWorld'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+worldName\b/));
  assert.ok(hasPattern(codeOnly, /\bPlayerAbility\s+unlockedByAbility\b/));
  assert.ok(hasPattern(codeOnly, /\bint\s+internalCollectibles\b/));
});

test('has hub and subWorlds fields', () => {
  assert.ok(hasPattern(codeOnly, /\bSubWorld\s+hub\b/));
  assert.ok(hasPattern(codeOnly, /\bSubWorld\[\]\s+subWorlds\b/));
});

test('CanAccess method exists and checks ability gating', () => {
  assert.ok(hasPattern(codeOnly, /\bCanAccess\s*\(/));
  assert.ok(hasPattern(codeOnly, /PlayerAbility\[\]\s+\w+/));
  assert.ok(hasPattern(codeOnly, /PlayerAbility\.None/));
});

test('AccessibleWorlds method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bAccessibleWorlds\s*\(/));
});
