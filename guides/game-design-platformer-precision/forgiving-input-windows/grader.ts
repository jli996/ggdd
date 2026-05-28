import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'JumpTolerances.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('coyoteTimeSeconds in (0, 0.2]', () => {
  const m = codeOnly.match(/coyoteTimeSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected coyoteTimeSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 0.2, `coyoteTimeSeconds ${v} not in (0, 0.2]`);
});

test('jumpBufferSeconds in (0, 0.3]', () => {
  const m = codeOnly.match(/jumpBufferSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected jumpBufferSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 0.3, `jumpBufferSeconds ${v} not in (0, 0.3]`);
});

test('shortHopMultiplier in (0, 0.7)', () => {
  const m = codeOnly.match(/shortHopMultiplier\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected shortHopMultiplier literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v < 0.7, `shortHopMultiplier ${v} not in (0, 0.7)`);
});

test('OnGrounded and OnJumpPressed methods exist', () => {
  assert.ok(hasPattern(codeOnly, /\bOnGrounded\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bOnJumpPressed\s*\(/));
});

test('CanJump checks both coyote and buffer windows', () => {
  assert.ok(hasPattern(codeOnly, /\bCanJump\s*\(/));
  assert.ok(hasPattern(codeOnly, /lastGroundedAt/));
  assert.ok(hasPattern(codeOnly, /lastJumpPressedAt/));
});

test('ComputeJumpVelocity takes a bool parameter (held)', () => {
  assert.ok(hasPattern(codeOnly, /\bComputeJumpVelocity\s*\(\s*bool\s+\w+\s*\)/));
});
