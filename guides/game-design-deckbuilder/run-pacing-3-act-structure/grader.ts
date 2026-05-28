import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RunActConfig.cs');
const src = readCSharp(TARGET);

test('extends ScriptableObject', () => {
  assert.ok(hasPattern(src, /:\s*ScriptableObject\b/));
});

test('has CreateAssetMenu attribute', () => {
  assert.ok(hasPattern(src, /\[CreateAssetMenu\b/));
});

test('declares 3 act fields (act1, act2, act3)', () => {
  assert.ok(hasPattern(src, /\bact1\b/));
  assert.ok(hasPattern(src, /\bact2\b/));
  assert.ok(hasPattern(src, /\bact3\b/));
});

test('each act type has normalEncounterCount, eliteCount, restSiteCount', () => {
  assert.ok(hasPattern(src, /\bnormalEncounterCount\b/));
  assert.ok(hasPattern(src, /\beliteCount\b/));
  assert.ok(hasPattern(src, /\brestSiteCount\b/));
});

test('act2 eliteCount > act1 eliteCount (escalation)', () => {
  const a1 = src.match(/act1\s*=[\s\S]*?eliteCount\s*=\s*(\d+)/);
  const a2 = src.match(/act2\s*=[\s\S]*?eliteCount\s*=\s*(\d+)/);
  assert.ok(a1 && a2, 'expected eliteCount literals on act1 and act2');
  assert.ok(parseInt(a2![1], 10) > parseInt(a1![1], 10),
    `expected act2.eliteCount (${a2![1]}) > act1.eliteCount (${a1![1]})`);
});

test('act3 restSiteCount <= act2 restSiteCount (climax withholds rest)', () => {
  const a2 = src.match(/act2\s*=[\s\S]*?restSiteCount\s*=\s*(\d+)/);
  const a3 = src.match(/act3\s*=[\s\S]*?restSiteCount\s*=\s*(\d+)/);
  assert.ok(a2 && a3, 'expected restSiteCount literals on act2 and act3');
  assert.ok(parseInt(a3![1], 10) <= parseInt(a2![1], 10),
    `expected act3.restSiteCount (${a3![1]}) <= act2.restSiteCount (${a2![1]})`);
});
