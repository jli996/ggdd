import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'AnticipatoryCamera.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('has leadDistance serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+leadDistance\b/));
});

test('has maxLeadDistance serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+maxLeadDistance\b/));
});

test('has leadAtSpeed serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+leadAtSpeed\b/));
});

test('ComputeOffset method takes Vector2 playerVelocity', () => {
  assert.ok(hasPattern(codeOnly, /\bComputeOffset\s*\(\s*Vector2\s+\w+\s*\)/));
});

test('uses Mathf.Clamp or Mathf.Min to cap offset', () => {
  assert.ok(
    hasPattern(codeOnly, /Mathf\.Clamp\b/) || hasPattern(codeOnly, /Mathf\.Min\b/),
    'expected Mathf.Clamp or Mathf.Min for capping lead distance'
  );
});
