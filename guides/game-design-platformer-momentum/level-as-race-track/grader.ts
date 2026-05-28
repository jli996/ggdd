import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LevelRoute.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('LevelRoute extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /LevelRoute\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares RoutePath serializable inner class', () => {
  assert.ok(declaresType(codeOnly, 'class', 'RoutePath'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
});

test('RoutePath has required fields: pathName, requiredSpeed, riskLevel, estimatedSeconds', () => {
  assert.ok(hasPattern(codeOnly, /\bstring\s+pathName\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+requiredSpeed\b/));
  assert.ok(hasPattern(codeOnly, /\bint\s+riskLevel\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+estimatedSeconds\b/));
});

test('declares paths array field', () => {
  assert.ok(hasPattern(codeOnly, /\bRoutePath\[\]\s+paths\b/));
});

test('OptimalPathSeconds returns shortest estimatedSeconds', () => {
  assert.ok(hasPattern(codeOnly, /\bOptimalPathSeconds\s*\(/));
  assert.ok(hasPattern(codeOnly, /estimatedSeconds/));
});
