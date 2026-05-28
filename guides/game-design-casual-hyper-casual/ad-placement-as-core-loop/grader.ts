import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'AdPlacement.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('interstitialEveryNRuns in [2, 10]', () => {
  assert.ok(hasPattern(codeOnly, /\binterstitialEveryNRuns\b/));
  const match = codeOnly.match(/interstitialEveryNRuns\s*=\s*(\d+)/);
  assert.ok(match, 'interstitialEveryNRuns must have a numeric default');
  const val = parseInt(match![1], 10);
  assert.ok(val >= 2 && val <= 10, `interstitialEveryNRuns must be in [2,10], got ${val}`);
});

test('minSecondsBetweenInterstitials in [30, 300]', () => {
  assert.ok(hasPattern(codeOnly, /\bminSecondsBetweenInterstitials\b/));
  const match = codeOnly.match(/minSecondsBetweenInterstitials\s*=\s*([\d.]+)f?/);
  assert.ok(match, 'minSecondsBetweenInterstitials must have a numeric default');
  const val = parseFloat(match![1]);
  assert.ok(val >= 30 && val <= 300, `minSecondsBetweenInterstitials must be in [30,300], got ${val}`);
});

test('offerRewardedDoubleCoins AND offerRewardedContinue fields exist', () => {
  assert.ok(hasPattern(codeOnly, /\bofferRewardedDoubleCoins\b/));
  assert.ok(hasPattern(codeOnly, /\bofferRewardedContinue\b/));
});

test('ShouldShowInterstitial(int, float) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bShouldShowInterstitial\s*\(\s*int\b[\s\S]*?,\s*float\b/));
});

test('ShouldShowInterstitial uses && (both conditions required)', () => {
  assert.ok(hasPattern(codeOnly, /ShouldShowInterstitial[\s\S]{0,300}&&/));
});
