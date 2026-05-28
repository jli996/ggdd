import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'StaminaSystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('has serialized maxStamina field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+maxStamina\b/));
});

test('has serialized regenDelayAfterUseSeconds > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+regenDelayAfterUseSeconds\b/));
  const m = codeOnly.match(/regenDelayAfterUseSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected regenDelayAfterUseSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0, `regenDelayAfterUseSeconds ${v} must be > 0`);
});

test('TryConsume returns bool', () => {
  assert.ok(hasPattern(codeOnly, /\bbool\s+TryConsume\s*\(\s*float/));
});

test('TryConsume prevents negative stamina (Mathf.Max or clamp)', () => {
  assert.ok(hasPattern(codeOnly, /Mathf\.Max\s*\(\s*0f?\s*,|Mathf\.Clamp/));
});

test('has lastStaminaUseAt timestamp field for regen delay', () => {
  assert.ok(hasPattern(codeOnly, /lastStaminaUseAt/));
});

test('Update regens stamina using regenDelayAfterUseSeconds', () => {
  assert.ok(hasPattern(codeOnly, /void\s+Update\s*\(/));
  assert.ok(hasPattern(codeOnly, /regenDelayAfterUseSeconds/));
  assert.ok(hasPattern(codeOnly, /regenPerSecond/));
});
