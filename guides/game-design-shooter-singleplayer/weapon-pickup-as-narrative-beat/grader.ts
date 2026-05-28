import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'WeaponPickup.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('WeaponPickup extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /WeaponPickup\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares StoryAct enum with ≥4 acts', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'StoryAct'));
  const m = codeOnly.match(/enum\s+StoryAct\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 4, `expected ≥4 StoryAct values, got ${values.length}: ${values.join(', ')}`);
});

test('has weaponName field', () => {
  assert.ok(hasPattern(codeOnly, /\bstring\s+weaponName\b/));
});

test('has act field of type StoryAct', () => {
  assert.ok(hasPattern(codeOnly, /\bStoryAct\s+act\b/));
});

test('has actMissionIndex int field', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+actMissionIndex\b/));
});

test('has isNarrativeBeat bool field', () => {
  assert.ok(hasPattern(codeOnly, /\bbool\s+isNarrativeBeat\b/));
});
