import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EncounterBalance.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares a ZoneTier enum', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'ZoneTier'));
});

test('enum has at least 3 distinct values', () => {
  const m = codeOnly.match(/enum\s+ZoneTier\s*\{([^}]+)\}/);
  assert.ok(m, 'ZoneTier enum body not found');
  const values = m![1].split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 3, `expected ≥3 zone tiers, got ${values.length}: ${values.join(', ')}`);
});

test('has a nakedDamageSoftCap serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+\w*naked\w*[Cc]ap/i));
});

test('ScaleDamageToTarget uses Mathf.Min (or equivalent clamp)', () => {
  assert.ok(hasPattern(codeOnly, /\bScaleDamageToTarget\s*\(/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Min\s*\(/) || hasPattern(codeOnly, /\?\s*Mathf\.Min/));
});

test('ZoneLootMultiplier returns different values per zone (uses switch or if chain)', () => {
  assert.ok(hasPattern(codeOnly, /\bZoneLootMultiplier\s*\(/));
  // Must reference at least 2 distinct enum values.
  const refs = codeOnly.match(/ZoneTier\.\w+/g) ?? [];
  const distinct = new Set(refs);
  assert.ok(distinct.size >= 2, `expected ≥2 distinct zone refs in multiplier, found ${distinct.size}`);
});
