import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'InstantRestart.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('restartTransitionSeconds literal ≤ 0.5', () => {
  assert.ok(hasPattern(codeOnly, /\brestartTransitionSeconds\b/));
  const match = codeOnly.match(/restartTransitionSeconds\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'restartTransitionSeconds must have a numeric default');
  assert.ok(parseFloat(match![1]) <= 0.5, `restartTransitionSeconds must be ≤ 0.5, got ${match![1]}`);
});

test('showRetryButtonImmediately defaults to true', () => {
  assert.ok(hasPattern(codeOnly, /\bshowRetryButtonImmediately\b/));
  assert.ok(hasPattern(codeOnly, /showRetryButtonImmediately\s*=\s*true\b/));
});

test('OnPlayerDeath method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bOnPlayerDeath\b/));
});

test('Restart method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bRestart\b\s*\(\s*\)/));
});

test('IsInstantRestart checks both conditions (≤0.5 and showRetryButtonImmediately)', () => {
  assert.ok(hasPattern(codeOnly, /\bIsInstantRestart\b/));
  assert.ok(hasPattern(codeOnly, /restartTransitionSeconds[\s\S]{0,50}0\.5/));
  assert.ok(hasPattern(codeOnly, /IsInstantRestart[\s\S]{0,300}showRetryButtonImmediately/));
});
