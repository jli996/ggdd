import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ExtractionZone.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares openWindowSeconds in [30, 300]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[oO]penWindow\w*\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected [SerializeField] float for openWindowSeconds');
  const v = parseFloat(m![1]);
  assert.ok(v >= 30 && v <= 300, `openWindowSeconds default ${v} not in [30, 300]`);
});

test('declares distanceFromSpawn serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+\w*[dD]istance\w*/));
});

test('declares lootRewardMultiplier serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+\w*[Ll]oot\w*[Mm]ult/));
});

test('IsOpen property or method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsOpen\b/));
});

test('Open() method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bvoid\s+Open\s*\(/));
});

test('RewardForExtract scales by distance (refers to distance field)', () => {
  const r = codeOnly.match(/RewardForExtract\s*\([^)]*\)[\s\S]*?\}\s*$/m);
  if (r) {
    assert.ok(/distance/i.test(r[0]), 'RewardForExtract body should reference a distance field');
  } else {
    // Expression body version.
    assert.ok(hasPattern(codeOnly, /RewardForExtract\s*\([^)]*\)\s*=>[^;]*distance/i));
  }
});
