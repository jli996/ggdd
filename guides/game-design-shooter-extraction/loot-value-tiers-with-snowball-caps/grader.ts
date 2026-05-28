import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LootDrop.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares LootTier enum with ≥4 tiers', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'LootTier'));
  const m = codeOnly.match(/enum\s+LootTier\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 4, `expected ≥4 LootTier values, got ${values.length}: ${values.join(', ')}`);
});

test('legendary chance default ≤ 0.10', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[Ll]egendary[Cc]hance\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected [SerializeField] float for legendaryChance');
  const v = parseFloat(m![1]);
  assert.ok(v <= 0.10, `legendaryChance default ${v} > 0.10 — top tier should be rare`);
});

test('declares secureSlotCount serialized int > 0', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?int\s+\w*[Ss]ecure\w*\s*=\s*(\d+)/);
  assert.ok(m, 'expected [SerializeField] int for secureSlotCount');
  const v = parseInt(m![1], 10);
  assert.ok(v > 0, `secureSlotCount ${v} not > 0`);
});

test('RollTier method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bRollTier\s*\(/));
});

test('IsSecureSlot method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsSecureSlot\s*\(/));
});

test('per-tier chance fields exist (common/uncommon/rare/legendary)', () => {
  assert.ok(hasPattern(codeOnly, /\bcommonChance\b/i));
  assert.ok(hasPattern(codeOnly, /\buncommonChance\b/i));
  assert.ok(hasPattern(codeOnly, /\brareChance\b/i));
  assert.ok(hasPattern(codeOnly, /\blegendaryChance\b/i));
});
