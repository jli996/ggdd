import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'VisionCone.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('has serialized visionRangeMeters field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+visionRangeMeters\b/));
});

test('has serialized coneAngleDegrees field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+coneAngleDegrees\b/));
});

test('has serialized lightThreshold and motionVisibilityBoost fields', () => {
  assert.ok(hasPattern(codeOnly, /\bfloat\s+lightThreshold\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+motionVisibilityBoost\b/));
});

test('CanSee takes 3 arguments (Vector3, float, float)', () => {
  assert.ok(hasPattern(codeOnly, /\bCanSee\s*\(\s*Vector3\s+\w+\s*,\s*float\s+\w+\s*,\s*float\s+\w+\s*\)/));
});

test('uses Vector3.Distance for range check', () => {
  assert.ok(hasPattern(codeOnly, /Vector3\.Distance\s*\(/));
});

test('uses Vector3.Angle for cone check', () => {
  assert.ok(hasPattern(codeOnly, /Vector3\.Angle\s*\(/));
});
