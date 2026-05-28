import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'CollectathonCamera.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('has orbitDistance serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+orbitDistance\b/));
});

test('has autoFrameEnabled serialized bool field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?bool\s+autoFrameEnabled\b/));
});

test('has manualOverridePriority serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?(int|float)\s+manualOverridePriority\b/));
});

test('has useCinemachine3 serialized bool field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?bool\s+useCinemachine3\b/));
});

test('ShouldYieldToPlayer method takes a bool parameter', () => {
  assert.ok(hasPattern(codeOnly, /\bShouldYieldToPlayer\s*\(\s*bool\s+\w+\s*\)/));
});
