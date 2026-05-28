import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'InputBuffer.cs');
const src = readCSharp(TARGET);

test('declares a serialized buffer-window field', () => {
  assert.ok(hasPattern(src, /\[SerializeField\][\s\S]*?\bfloat\s+\w+/));
});

test('stores press time in a field', () => {
  // A float field that gets assigned Time.time somewhere.
  assert.ok(hasPattern(src, /\bfloat\s+\w+/));
  assert.ok(hasPattern(src, /=\s*Time\.time\b/));
});

test('has a press handler (OnJumpPressed or similar that assigns Time.time)', () => {
  assert.ok(hasPattern(src, /void\s+\w*Press\w*\s*\(/));
});

test('has a consume method that compares Time.time against the buffer window', () => {
  assert.ok(hasPattern(src, /\bTryConsume\w+\s*\(/));
  // Body should use Time.time - someField pattern.
  assert.ok(hasPattern(src, /Time\.time\s*-\s*\w+/));
});

test('clears the buffer on consume (sentinel assignment)', () => {
  assert.ok(hasPattern(src, /=\s*-1(?:\.0+)?f?\b/));
});

test('buffer window in sensible range (0.05f to 0.3f)', () => {
  const numerics = src.match(/=\s*(0\.\d+)f?/g);
  const ok = !!numerics?.some(m => {
    const v = parseFloat(m.replace(/[^\d.]/g, ''));
    return v >= 0.05 && v <= 0.3;
  });
  assert.ok(ok, `expected buffer window literal in [0.05, 0.3]; saw: ${numerics?.join(', ')}`);
});
