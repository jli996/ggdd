import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'MergeBoardGuard.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('boardCapacity serialized int > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+boardCapacity/));
  const m = codeOnly.match(/boardCapacity\s*=\s*(\d+)/);
  assert.ok(m, 'expected boardCapacity literal');
  const v = parseInt(m![1]);
  assert.ok(v > 0, `boardCapacity ${v} must be > 0`);
});

test('spawnReservedSlots serialized int > 0', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+spawnReservedSlots\b/));
  const m = codeOnly.match(/spawnReservedSlots\s*=\s*(\d+)/);
  assert.ok(m, 'expected spawnReservedSlots literal');
  const v = parseInt(m![1]);
  assert.ok(v > 0, `spawnReservedSlots ${v} must be > 0`);
});

test('sellEnabled bool field exists', () => {
  assert.ok(hasPattern(codeOnly, /\bbool\s+sellEnabled\b/));
});

test('CanAcceptSpawn method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bCanAcceptSpawn\s*\(\s*int\b/));
});

test('WouldBeStuck method exists and checks pendingMergeCount', () => {
  assert.ok(hasPattern(codeOnly, /\bWouldBeStuck\s*\(\s*int\b/));
  assert.ok(hasPattern(codeOnly, /pendingMergeCount/));
});
