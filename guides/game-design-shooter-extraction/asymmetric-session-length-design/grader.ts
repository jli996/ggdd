import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RaidConfig.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject\b/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares MapTier (or similar) inner class with required fields', () => {
  assert.ok(hasPattern(codeOnly, /\bclass\s+\w*[Mm]ap[Tt]ier\w*/) || hasPattern(codeOnly, /\bMapTier\b/));
  assert.ok(hasPattern(codeOnly, /\bmapName\b/));
  assert.ok(hasPattern(codeOnly, /\braidDurationMinutes\b/));
  assert.ok(hasPattern(codeOnly, /\bplayerCount\b/));
});

test('declares 3 tier fields (shortRaid, mediumRaid, longRaid)', () => {
  assert.ok(hasPattern(codeOnly, /\bshortRaid\b/));
  assert.ok(hasPattern(codeOnly, /\bmediumRaid\b/));
  assert.ok(hasPattern(codeOnly, /\blongRaid\b/));
});

test('shortRaid duration ≤ 25 minutes', () => {
  const m = codeOnly.match(/shortRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected shortRaid.raidDurationMinutes literal');
  assert.ok(parseFloat(m![1]) <= 25, `shortRaid duration ${m![1]} > 25`);
});

test('longRaid duration ≥ 60 minutes', () => {
  const m = codeOnly.match(/longRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected longRaid.raidDurationMinutes literal');
  assert.ok(parseFloat(m![1]) >= 60, `longRaid duration ${m![1]} < 60`);
});

test('mediumRaid duration strictly between short and long', () => {
  const sm = codeOnly.match(/shortRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  const mm = codeOnly.match(/mediumRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  const lm = codeOnly.match(/longRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(sm && mm && lm, 'expected all three raidDurationMinutes literals');
  const s = parseFloat(sm![1]), m = parseFloat(mm![1]), l = parseFloat(lm![1]);
  assert.ok(s < m && m < l, `expected short(${s}) < medium(${m}) < long(${l})`);
});
