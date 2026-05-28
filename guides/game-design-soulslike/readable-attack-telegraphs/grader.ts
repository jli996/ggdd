import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EnemyAttackTelegraph.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('windupSeconds in [0.5, 1.2]', () => {
  const m = codeOnly.match(/windupSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected windupSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 0.5 && v <= 1.2, `windupSeconds ${v} not in [0.5, 1.2]`);
});

test('recoverySeconds > 0', () => {
  const m = codeOnly.match(/recoverySeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected recoverySeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0, `recoverySeconds ${v} must be > 0`);
});

test('staggerWindowSeconds in [0.1, 0.5]', () => {
  const m = codeOnly.match(/staggerWindowSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected staggerWindowSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 0.1 && v <= 0.5, `staggerWindowSeconds ${v} not in [0.1, 0.5]`);
});

test('StartTelegraph method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bvoid\s+StartTelegraph\s*\(/));
});

test('IsAttacking method exists and references windupSeconds', () => {
  assert.ok(hasPattern(codeOnly, /\bIsAttacking\s*\(/));
  assert.ok(hasPattern(codeOnly, /windupSeconds/));
});

test('IsInStaggerWindow method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsInStaggerWindow\s*\(/));
});

test('attackStartedAt timestamp field exists', () => {
  assert.ok(hasPattern(codeOnly, /attackStartedAt/));
});
