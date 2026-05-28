import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'SpecialTileFactory.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('ScriptableObject with [CreateAssetMenu]', () => {
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu/));
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject/));
});

test('SpecialTileType enum with at least 4 values including None', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'SpecialTileType'));
  assert.ok(hasPattern(codeOnly, /\bNone\b/));
  const m = codeOnly.match(/enum\s+SpecialTileType\s*\{([^}]+)\}/);
  assert.ok(m, 'expected SpecialTileType enum body');
  const values = m![1].split(',').filter(v => v.trim().length > 0);
  assert.ok(values.length >= 4, `SpecialTileType has ${values.length} values, expected >= 4`);
});

test('MatchShape enum with at least 4 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'MatchShape'));
  const m = codeOnly.match(/enum\s+MatchShape\s*\{([^}]+)\}/);
  assert.ok(m, 'expected MatchShape enum body');
  const values = m![1].split(',').filter(v => v.trim().length > 0);
  assert.ok(values.length >= 4, `MatchShape has ${values.length} values, expected >= 4`);
});

test('SpecialThreshold serializable inner class exists', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(declaresType(codeOnly, 'class', 'SpecialThreshold'));
});

test('WhatDoesShapeCreate method takes MatchShape parameter', () => {
  assert.ok(hasPattern(codeOnly, /\bWhatDoesShapeCreate\s*\(\s*MatchShape\b/));
});
