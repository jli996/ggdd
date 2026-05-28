import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'HitFeedback.cs');
const src = readCSharp(TARGET);

test('declares a public HitStop method', () => {
  assert.ok(hasPattern(src, /public\s+\S+\s+HitStop\s*\(/));
});

test('sets Time.timeScale to 0 (or < 1) somewhere', () => {
  assert.ok(hasPattern(src, /Time\.timeScale\s*=\s*0(?:\.0+)?f?/) ||
            hasPattern(src, /Time\.timeScale\s*=\s*0\.[1-9]/));
});

test('restores Time.timeScale to 1 somewhere', () => {
  assert.ok(hasPattern(src, /Time\.timeScale\s*=\s*1(?:\.0+)?f?/));
});

test('uses WaitForSecondsRealtime (not plain WaitForSeconds)', () => {
  assert.ok(hasPattern(src, /\bWaitForSecondsRealtime\b/));
  assert.ok(hasNoPattern(src, /\bnew\s+WaitForSeconds\b/));
});

test('uses a sensible hit-stop duration (between 0.03 and 0.15 seconds)', () => {
  // Find every float literal in the source and check at least one is in [0.03, 0.15].
  const numerics = src.match(/\b\d+\.\d+f?\b/g) ?? [];
  const ok = numerics.some(m => {
    const v = parseFloat(m.replace(/f$/, ''));
    return v >= 0.03 && v <= 0.15;
  });
  assert.ok(ok, `expected a duration literal in [0.03, 0.15], saw: ${numerics.join(', ')}`);
});
