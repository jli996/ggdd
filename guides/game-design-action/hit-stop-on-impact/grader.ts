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
  const matches = src.match(/\b0\.(0[3-9]|1[0-5]?)\d*f?\b/g);
  assert.ok(matches && matches.length >= 1,
    `expected a duration literal between 0.03 and 0.15, found none in: ${src.match(/\b\d+\.\d+f?\b/g)?.join(', ')}`);
});
