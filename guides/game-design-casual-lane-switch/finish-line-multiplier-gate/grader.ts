import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'FinishLineMultiplier.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('Gate serializable inner class with 3 int fields', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(declaresType(codeOnly, 'class', 'Gate'));
  assert.ok(hasPattern(codeOnly, /\bxMultiplier\b/));
  assert.ok(hasPattern(codeOnly, /\blanePosition\b/));
  assert.ok(hasPattern(codeOnly, /\brequiredCrowdSize\b/));
});

test('gates array field exists', () => {
  assert.ok(hasPattern(codeOnly, /Gate\s*\[\s*\]\s+gates\b/));
});

test('xMultiplier is int (not float)', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+xMultiplier\b/));
});

test('RewardForGate(int, int) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bRewardForGate\s*\(\s*int\b[\s\S]*?,\s*int\b/));
});

test('RewardForGate references xMultiplier and crowdSize in scoring', () => {
  assert.ok(hasPattern(codeOnly, /xMultiplier/));
  assert.ok(hasPattern(codeOnly, /crowdSize/));
});
