import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PropMaterialApplier.cs');
const src = readCSharp(TARGET);

test('declares a MaterialPropertyBlock field', () => {
  assert.ok(hasPattern(src, /\bMaterialPropertyBlock\b/));
});

test('caches Shader.PropertyToID as static readonly int', () => {
  assert.ok(hasPattern(src, /static\s+readonly\s+int\s+\w+\s*=\s*Shader\.PropertyToID\s*\(/));
});

test('uses GetPropertyBlock + SetPropertyBlock', () => {
  assert.ok(hasPattern(src, /\.GetPropertyBlock\s*\(/));
  assert.ok(hasPattern(src, /\.SetPropertyBlock\s*\(/));
});

test('does not assign .material.color', () => {
  assert.ok(hasNoPattern(src, /\.material\.color\s*=/));
});

test('does not call .material.SetColor', () => {
  assert.ok(hasNoPattern(src, /\.material\.SetColor\s*\(/));
});
