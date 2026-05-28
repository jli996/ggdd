import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'SoundPropagation.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('has serialized maxHearingRangeMeters field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+maxHearingRangeMeters\b/));
});

test('has serialized wallAttenuationDb field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+wallAttenuationDb\b/));
});

test('IsAudible takes 3 args: Vector3, Vector3, int', () => {
  assert.ok(hasPattern(codeOnly, /\bIsAudible\s*\(\s*Vector3\s+\w+\s*,\s*Vector3\s+\w+\s*,\s*int\s+\w+\s*\)/));
});

test('IsAudible checks against maxHearingRangeMeters', () => {
  assert.ok(hasPattern(codeOnly, /maxHearingRangeMeters/));
  assert.ok(hasPattern(codeOnly, /Vector3\.Distance\s*\(/));
});

test('IsAudible applies wallAttenuationDb per wall', () => {
  assert.ok(hasPattern(codeOnly, /wallAttenuationDb/));
});

test('uses Mathf for clamping', () => {
  assert.ok(hasPattern(codeOnly, /Mathf\./));
});
