import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EconomySystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

const winM = codeOnly.match(/\bwinBonus\s*=\s*(\d+)/);
const baseLossM = codeOnly.match(/\bbaseLossBonus\s*=\s*(\d+)/);
const maxLossM = codeOnly.match(/\bmaxLossBonus\s*=\s*(\d+)/);
const killM = codeOnly.match(/\bkillReward\s*=\s*(\d+)/);

test('declares all required serialized economy fields', () => {
  for (const name of ['winBonus', 'baseLossBonus', 'lossStreakIncrement', 'maxLossBonus', 'killReward', 'moneyCap']) {
    assert.ok(hasPattern(codeOnly, new RegExp(`\\[SerializeField\\][\\s\\S]*?\\b${name}\\b`)), `missing [SerializeField] ${name}`);
  }
});

test('winBonus > maxLossBonus (winning beats losing)', () => {
  assert.ok(winM && maxLossM, 'expected winBonus and maxLossBonus literals');
  assert.ok(parseInt(winM![1], 10) > parseInt(maxLossM![1], 10),
    `winBonus ${winM![1]} should be > maxLossBonus ${maxLossM![1]}`);
});

test('killReward ≤ baseLossBonus / 2 (kills are flavor, not primary income)', () => {
  assert.ok(killM && baseLossM, 'expected killReward and baseLossBonus literals');
  assert.ok(parseInt(killM![1], 10) <= parseInt(baseLossM![1], 10) / 2,
    `killReward ${killM![1]} > baseLossBonus / 2 = ${parseInt(baseLossM![1], 10) / 2}`);
});

test('LossBonusForStreak method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bLossBonusForStreak\s*\(/));
});

test('AddRoundReward clamps to moneyCap via Mathf.Min', () => {
  assert.ok(hasPattern(codeOnly, /\bAddRoundReward\s*\(/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Min\s*\([^)]*moneyCap/));
});
