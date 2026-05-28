import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ResourceGenerator.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('3 serialized per-resource float fields present', () => {
  assert.ok(hasPattern(codeOnly, /\bwoodPerHour\b/));
  assert.ok(hasPattern(codeOnly, /\bironPerHour\b/));
  assert.ok(hasPattern(codeOnly, /\bfoodPerHour\b/));
});

test('storageCap serialized int > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+storageCap/));
  const m = codeOnly.match(/storageCap\s*=\s*(\d+)/);
  assert.ok(m, 'expected storageCap literal');
  assert.ok(parseInt(m![1]) > 0, 'storageCap must be > 0');
});

test('AccumulatedSince(float, float) uses Mathf.Min with storageCap', () => {
  assert.ok(hasPattern(codeOnly, /\bAccumulatedSince\s*\(\s*float\b[\s\S]*?,\s*float\b/));
  assert.ok(hasPattern(codeOnly, /\bMathf\.Min\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bstorageCap\b[\s\S]*?\bAccumulatedSince\b|\bAccumulatedSince\b[\s\S]*?\bstorageCap\b/));
});

test('per-resource rates default > 0', () => {
  const wood = codeOnly.match(/woodPerHour\s*=\s*(\d+(?:\.\d+)?)f?/);
  const iron = codeOnly.match(/ironPerHour\s*=\s*(\d+(?:\.\d+)?)f?/);
  const food = codeOnly.match(/foodPerHour\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(wood && parseFloat(wood[1]) > 0, 'woodPerHour must be > 0');
  assert.ok(iron && parseFloat(iron[1]) > 0, 'ironPerHour must be > 0');
  assert.ok(food && parseFloat(food[1]) > 0, 'foodPerHour must be > 0');
});

test('does NOT use Update() for resource generation', () => {
  assert.ok(hasNoPattern(codeOnly, /\bvoid\s+Update\s*\(\s*\)/));
});
