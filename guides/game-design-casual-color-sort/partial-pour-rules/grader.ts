import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'BottlePour.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('bottleCapacity serialized int in [3, 8]', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+bottleCapacity/));
  const m = codeOnly.match(/bottleCapacity\s*=\s*(\d+)/);
  assert.ok(m, 'expected bottleCapacity literal');
  const v = parseInt(m![1]);
  assert.ok(v >= 3 && v <= 8, `bottleCapacity ${v} not in [3, 8]`);
});

test('CanPour takes three int parameters', () => {
  assert.ok(hasPattern(codeOnly, /\bCanPour\s*\(\s*int\b[\s\S]*?,\s*int\b[\s\S]*?,\s*int\b/));
});

test('CanPour references color equality check', () => {
  assert.ok(hasPattern(codeOnly, /topColorSrc\s*==\s*topColorDst|topColorDst\s*==\s*topColorSrc/));
});

test('HowMuchPours returns int and uses Mathf.Min', () => {
  assert.ok(hasPattern(codeOnly, /\bHowMuchPours\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bMathf\.Min\s*\(/));
});

test('HowMuchPours takes three int parameters', () => {
  assert.ok(hasPattern(codeOnly, /\bHowMuchPours\s*\(\s*int\b[\s\S]*?,\s*int\b[\s\S]*?,\s*int\b/));
});
