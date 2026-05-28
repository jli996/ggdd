import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'SetPieceCadence.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('SetPieceCadence extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /SetPieceCadence\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares SetPieceType enum with ≥5 types', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'SetPieceType'));
  const m = codeOnly.match(/enum\s+SetPieceType\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 SetPieceType values, got ${values.length}: ${values.join(', ')}`);
});

test('declares CadenceEntry serializable inner class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'CadenceEntry'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bSetPieceType\s+type\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+minutesIntoMission\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+durationMinutes\b/));
});

test('has cadence array field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?CadenceEntry\[\]\s+cadence/));
});

test('targetSpacingMinutes in [15, 45]', () => {
  const m = codeOnly.match(/targetSpacingMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected targetSpacingMinutes literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 15 && v <= 45, `targetSpacingMinutes ${v} not in [15, 45]`);
});

test('IsValidCadence method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsValidCadence\s*\(/));
});
