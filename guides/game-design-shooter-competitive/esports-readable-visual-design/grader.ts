import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EsportsReadability.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares teamAColor and teamBColor serialized Color fields', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?Color\s+teamAColor\b/));
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?Color\s+teamBColor\b/));
});

test('killFeedPersistSeconds default in [3, 10]', () => {
  const m = codeOnly.match(/killFeedPersistSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected killFeedPersistSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 3 && v <= 10, `killFeedPersistSeconds default ${v} not in [3, 10]`);
});

test('observerModeEnabled and observerHidesHud fields exist', () => {
  assert.ok(hasPattern(codeOnly, /\bobserverModeEnabled\b/));
  assert.ok(hasPattern(codeOnly, /\bobserverHidesHud\b/));
});

test('TeamColorContrast method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bTeamColorContrast\s*\(/));
});

test('IsKillFeedReadable and IsObserverModeReady exist', () => {
  assert.ok(hasPattern(codeOnly, /\bIsKillFeedReadable\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bIsObserverModeReady\s*\(/));
});
