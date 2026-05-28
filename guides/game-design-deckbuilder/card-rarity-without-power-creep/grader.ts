import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'CardData.cs');
const src = readCSharp(TARGET);

test('declares CardRarity enum with Common, Uncommon, Rare', () => {
  assert.ok(hasPattern(src, /\benum\s+CardRarity\b/));
  assert.ok(hasPattern(src, /\bCommon\b/));
  assert.ok(hasPattern(src, /\bUncommon\b/));
  assert.ok(hasPattern(src, /\bRare\b/));
});

test('CardData extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(src, /CardData\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(src, /\[CreateAssetMenu\b/));
});

test('has a rarity field of type CardRarity', () => {
  assert.ok(hasPattern(src, /\bCardRarity\s+rarity\b/));
});

test('has a baseDamage field', () => {
  assert.ok(hasPattern(src, /\bint\s+baseDamage\b/));
});

test('damage is NOT scaled by rarity in the source', () => {
  // No `rarity == CardRarity.Rare` followed by damage arithmetic.
  assert.ok(hasNoPattern(src, /rarity\s*==\s*CardRarity\.(Rare|Uncommon)[\s\S]{0,80}?baseDamage\s*[*+]/));
});

test('has an effects array/list field', () => {
  assert.ok(hasPattern(src, /\b(string\[\]|List<\w+>)\s+effects\b/));
});
