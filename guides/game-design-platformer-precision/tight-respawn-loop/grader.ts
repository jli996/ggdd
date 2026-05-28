import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RespawnSystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('respawnDelaySeconds default ≤ 1.0', () => {
  const m = codeOnly.match(/respawnDelaySeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected respawnDelaySeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v <= 1.0, `respawnDelaySeconds ${v} > 1.0 — too slow for precision platformer`);
});

test('has Transform currentCheckpoint field', () => {
  assert.ok(hasPattern(codeOnly, /\bTransform\s+currentCheckpoint\b/));
});

test('has deathCount serialized int field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+deathCount\b/));
});

test('OnPlayerDeath method exists and increments deathCount', () => {
  assert.ok(hasPattern(codeOnly, /\bOnPlayerDeath\s*\(/));
  assert.ok(hasPattern(codeOnly, /deathCount\+\+|deathCount\s*\+=\s*1/));
});

test('SetCheckpoint method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bvoid\s+SetCheckpoint\s*\(\s*Transform/));
});

test('does NOT reload the whole scene on death', () => {
  assert.ok(!/SceneManager\.LoadScene/.test(codeOnly));
});
