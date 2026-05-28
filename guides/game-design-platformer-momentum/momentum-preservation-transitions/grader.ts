import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'MomentumTransitions.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('has preserveHorizontalOnLand serialized bool field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?bool\s+preserveHorizontalOnLand\b/));
});

test('wallJumpHorizontalRetention in (0, 1]', () => {
  const m = codeOnly.match(/wallJumpHorizontalRetention\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected wallJumpHorizontalRetention literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 1.0, `wallJumpHorizontalRetention ${v} not in (0, 1]`);
});

test('slopeMomentumGain serialized field exists', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+slopeMomentumGain\b/));
});

test('ProjectLandingVelocity method takes Vector2 and returns Vector2', () => {
  assert.ok(hasPattern(codeOnly, /\bVector2\s+ProjectLandingVelocity\s*\(\s*Vector2/));
});

test('WallJumpVelocity method exists and uses retention field', () => {
  assert.ok(hasPattern(codeOnly, /\bWallJumpVelocity\s*\(\s*Vector2/));
  assert.ok(hasPattern(codeOnly, /wallJumpHorizontalRetention/));
});
