import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'CombatEncounter.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares EnemyWave serializable class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'EnemyWave'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bstring\[\]\s+enemyTypes\b/));
  assert.ok(hasPattern(codeOnly, /\bint\s+totalEnemyCount\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+intensityCurve\b/));
});

test('declares waves array field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?EnemyWave\[\]\s+waves/));
});

test('declares ammoDropMin/ammoDropMax with min < max', () => {
  const minM = codeOnly.match(/ammoDropMin\s*=\s*(\d+)/);
  const maxM = codeOnly.match(/ammoDropMax\s*=\s*(\d+)/);
  assert.ok(minM && maxM, 'expected ammoDropMin and ammoDropMax literals');
  assert.ok(parseInt(minM![1], 10) < parseInt(maxM![1], 10),
    `ammoDropMin ${minM![1]} should be < ammoDropMax ${maxM![1]}`);
});

test('postEncounterHealthFraction in (0, 1]', () => {
  const m = codeOnly.match(/postEncounterHealthFraction\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected postEncounterHealthFraction literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 1, `postEncounterHealthFraction ${v} not in (0, 1]`);
});

test('IsValid method exists and checks wave count', () => {
  assert.ok(hasPattern(codeOnly, /\bbool\s+IsValid\s*\(/));
  assert.ok(hasPattern(codeOnly, /waves\.Length\s*<\s*2/));
});
