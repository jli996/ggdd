import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ResourceConverter.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('Resource enum with ≥3 values', () => {
  assert.ok(hasPattern(codeOnly, /\benum\s+Resource\b/));
  // Count enum members by looking for comma-separated identifiers inside the enum
  const enumMatch = codeOnly.match(/enum\s+Resource\s*\{([^}]+)\}/);
  assert.ok(enumMatch, 'Resource enum body must exist');
  const members = enumMatch![1].split(',').filter(s => s.trim().length > 0);
  assert.ok(members.length >= 3, `Resource enum needs ≥3 values, found ${members.length}`);
});

test('ConversionRecipe serializable inner class with 4 fields', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(declaresType(codeOnly, 'class', 'ConversionRecipe'));
  assert.ok(hasPattern(codeOnly, /\bcostResource\b/));
  assert.ok(hasPattern(codeOnly, /\bcostAmount\b/));
  assert.ok(hasPattern(codeOnly, /\bproducesResource\b/));
  assert.ok(hasPattern(codeOnly, /\bproducesRatePerSecond\b/));
});

test('recipes array field exists', () => {
  assert.ok(hasPattern(codeOnly, /ConversionRecipe\s*\[\s*\]\s+recipes\b/));
});

test('CanAfford(Resource[], int) exists', () => {
  assert.ok(hasPattern(codeOnly, /\bCanAfford\s*\(/));
  assert.ok(hasPattern(codeOnly, /Resource\s*\[\s*\]/));
});

test('ApplyConversion method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bApplyConversion\b/));
});
