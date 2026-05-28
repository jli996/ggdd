import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'AlertState.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares AlertLevel enum with ≥5 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'AlertLevel'));
  const m = codeOnly.match(/enum\s+AlertLevel\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 AlertLevel values, got ${values.length}`);
});

test('AlertLevel enum includes all 5 required values', () => {
  const m = codeOnly.match(/enum\s+AlertLevel\s*\{([^}]+)\}/);
  const body = m?.[1] ?? '';
  assert.ok(/\bUnaware\b/.test(body), 'missing Unaware');
  assert.ok(/\bSuspicious\b/.test(body), 'missing Suspicious');
  assert.ok(/\bAlert\b/.test(body), 'missing Alert');
  assert.ok(/\bSearching\b/.test(body), 'missing Searching');
  assert.ok(/\bPatrol\b/.test(body), 'missing Patrol');
});

test('has serialized transitionCooldownSeconds > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+transitionCooldownSeconds\b/));
  const m = codeOnly.match(/transitionCooldownSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected transitionCooldownSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0, `transitionCooldownSeconds ${v} must be > 0`);
});

test('has currentLevel AlertLevel field and lastTransitionAt timestamp', () => {
  assert.ok(hasPattern(codeOnly, /\bAlertLevel\s+currentLevel\b/));
  assert.ok(hasPattern(codeOnly, /\blastTransitionAt\b/));
});

test('TransitionTo uses Time.time for hysteresis check', () => {
  assert.ok(hasPattern(codeOnly, /\bTransitionTo\s*\(/));
  assert.ok(hasPattern(codeOnly, /Time\.time/));
  assert.ok(hasPattern(codeOnly, /transitionCooldownSeconds/));
});

test('CanTransition method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bCanTransition\s*\(/));
});
