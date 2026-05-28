import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'Knockback.cs');
const src = readCSharp(TARGET);
// Strip line comments so assertions don't match commented-out tokens.
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares ApplyHit(Vector2 impulse)', () => {
  assert.ok(hasPattern(codeOnly, /\bvoid\s+ApplyHit\s*\(\s*Vector2\s+\w+\s*\)/));
});

test('applies force to a Rigidbody2D (AddForce)', () => {
  assert.ok(hasPattern(codeOnly, /\b\w*\.?AddForce\s*\(/));
});

test('exposes IsLockedOut (property or method)', () => {
  assert.ok(hasPattern(codeOnly, /\bIsLockedOut\b/));
});

test('uses Time.time to gate the lockout', () => {
  assert.ok(hasPattern(codeOnly, /\bTime\.time\b/));
});

test('lockout duration default literal is <= 0.3', () => {
  const m = codeOnly.match(/lockoutDuration\s*=\s*(\d+\.\d+)f?/);
  assert.ok(m, 'expected `lockoutDuration = <number>f` literal');
  const v = parseFloat(m![1]);
  assert.ok(v <= 0.3, `lockoutDuration default ${v} > 0.3 — guide caps lockouts at 0.3s`);
});
