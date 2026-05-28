import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'CollectibleLayout.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('CollectibleLayout extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /CollectibleLayout\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares CollectibleClump serializable inner class', () => {
  assert.ok(declaresType(codeOnly, 'class', 'CollectibleClump'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
});

test('CollectibleClump has roomName, count, and requiresAbility fields', () => {
  assert.ok(hasPattern(codeOnly, /\bstring\s+roomName\b/));
  assert.ok(hasPattern(codeOnly, /\bint\s+count\b/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+requiresAbility\b/));
});

test('declares clumps array field', () => {
  assert.ok(hasPattern(codeOnly, /\bCollectibleClump\[\]\s+clumps\b/));
});

test('TotalCollectibles method exists and sums count', () => {
  assert.ok(hasPattern(codeOnly, /\bTotalCollectibles\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bcount\b/));
});

test('IsRoomEmpty method exists and takes a string', () => {
  assert.ok(hasPattern(codeOnly, /\bIsRoomEmpty\s*\(\s*string/));
});
