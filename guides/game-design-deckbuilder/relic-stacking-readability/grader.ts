import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RelicData.cs');
const src = readCSharp(TARGET);

test('extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(src, /RelicData\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(src, /\[CreateAssetMenu\b/));
});

test('defines RelicHook enum with OnTurnStart, OnDamageTaken, OnCardPlayed', () => {
  assert.ok(hasPattern(src, /\benum\s+RelicHook\b/));
  assert.ok(hasPattern(src, /\bOnTurnStart\b/));
  assert.ok(hasPattern(src, /\bOnDamageTaken\b/));
  assert.ok(hasPattern(src, /\bOnCardPlayed\b/));
});

test('has a hook field of type RelicHook', () => {
  assert.ok(hasPattern(src, /\bRelicHook\s+hook\b/));
});

test('has a tooltip string field', () => {
  assert.ok(hasPattern(src, /\bstring\s+tooltip\b/));
});

test('no arrays of effects (single-effect convention)', () => {
  assert.ok(hasNoPattern(src, /\b(string|int|float|RelicHook)\[\]\s+\w*[Ee]ffect/));
  assert.ok(hasNoPattern(src, /\bList<\w+>\s+effects\b/));
});
