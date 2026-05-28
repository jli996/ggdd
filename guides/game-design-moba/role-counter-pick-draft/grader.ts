import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'DraftSystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('Role enum with at least 5 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'Role'));
  const m = codeOnly.match(/enum\s+Role\s*\{([^}]+)\}/);
  assert.ok(m, 'expected Role enum body');
  const values = m![1].split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected >= 5 Role values, got ${values.length}`);
});

test('banCount and pickCount serialized ints > 0', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+banCount/));
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+pickCount/));
  const bm = codeOnly.match(/banCount\s*=\s*(\d+)/);
  const pm = codeOnly.match(/pickCount\s*=\s*(\d+)/);
  assert.ok(bm && parseInt(bm[1]) > 0, 'banCount must be > 0');
  assert.ok(pm && parseInt(pm[1]) > 0, 'pickCount must be > 0');
});

test('pickAfterBan serialized bool exists', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?bool\s+pickAfterBan/));
});

test('IsValidDraft(Role[]) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsValidDraft\s*\(\s*Role\s*\[\s*\]/));
});

test('Role enum referenced in method body', () => {
  const matches = codeOnly.match(/\bRole\b/g) ?? [];
  assert.ok(matches.length >= 2, `expected Role referenced >= 2 times, got ${matches.length}`);
});
