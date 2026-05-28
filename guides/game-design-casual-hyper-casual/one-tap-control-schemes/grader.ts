import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'OneInputControl.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('InputMode enum with ≥3 values', () => {
  assert.ok(hasPattern(codeOnly, /\benum\s+InputMode\b/));
  const enumMatch = codeOnly.match(/enum\s+InputMode\s*\{([^}]+)\}/);
  assert.ok(enumMatch, 'InputMode enum body must exist');
  const members = enumMatch![1].split(',').filter(s => s.trim().length > 0);
  assert.ok(members.length >= 3, `InputMode enum needs ≥3 values, found ${members.length}`);
});

test('requiresTwoFingers bool field exists', () => {
  assert.ok(hasPattern(codeOnly, /\brequiresTwoFingers\b/));
  assert.ok(hasPattern(codeOnly, /\bbool\b[\s\S]*?\brequiresTwoFingers\b/));
});

test('IsHyperCasualValid method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsHyperCasualValid\b/));
});

test('IsHyperCasualValid body references requiresTwoFingers', () => {
  // Find the method body and confirm it references the field
  assert.ok(hasPattern(codeOnly, /IsHyperCasualValid[\s\S]{0,200}requiresTwoFingers/));
});

test('at least 2 single-input handler methods (OnTap/OnSwipe/OnHold*)', () => {
  const handlers = [
    /\bOnTap\b/,
    /\bOnHoldStart\b/,
    /\bOnHoldEnd\b/,
    /\bOnSwipe\b/,
  ];
  const found = handlers.filter(re => hasPattern(codeOnly, re)).length;
  assert.ok(found >= 2, `Expected ≥2 single-input handlers, found ${found}`);
});
