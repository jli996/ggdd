import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'SessionGuard.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares a serialized log-off-window field with a value in [10, 120]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[lL]og\w*\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected a [SerializeField] float for the log-off window');
  const v = parseFloat(m![1]);
  assert.ok(v >= 10 && v <= 120, `log-off window default ${v} not in [10, 120]`);
});

test('declares a serialized relog-cooldown field with a value in [30, 600]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[rR]elog\w*\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected a [SerializeField] float for the relog cooldown');
  const v = parseFloat(m![1]);
  assert.ok(v >= 30 && v <= 600, `relog cooldown default ${v} not in [30, 600]`);
});

test('exposes RequestLogOff and CanCompleteLogOff', () => {
  assert.ok(hasPattern(codeOnly, /\bRequestLogOff\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bCanCompleteLogOff\s*\(/));
});

test('exposes OnDisconnect and CanRejoin', () => {
  assert.ok(hasPattern(codeOnly, /\bOnDisconnect\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bCanRejoin\s*\(/));
});

test('uses Time.time (not coroutines) for the windows', () => {
  assert.ok(hasPattern(codeOnly, /\bTime\.time\b/));
});
