import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'BonfireShortcut.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('BonfireShortcut extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /BonfireShortcut\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares Bonfire serializable inner class with id, displayName, unlockShortcuts', () => {
  assert.ok(declaresType(codeOnly, 'class', 'Bonfire'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+id\b/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+displayName\b/));
  assert.ok(hasPattern(codeOnly, /\bstring\[\]\s+unlockShortcuts\b/));
});

test('declares Shortcut inner class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'Shortcut'));
  assert.ok(hasPattern(codeOnly, /\bstring\s+shortcutId\b/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+fromBonfireId\b/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+toBonfireId\b/));
  assert.ok(hasPattern(codeOnly, /\bbool\s+twoWay\b/));
});

test('has bonfires and shortcuts array fields', () => {
  assert.ok(hasPattern(codeOnly, /\bBonfire\[\]\s+bonfires\b/));
  assert.ok(hasPattern(codeOnly, /\bShortcut\[\]\s+shortcuts\b/));
});

test('IsUnlockedShortcut method exists and takes a string', () => {
  assert.ok(hasPattern(codeOnly, /\bIsUnlockedShortcut\s*\(\s*string/));
});

test('GetShortcut method exists and takes a string', () => {
  assert.ok(hasPattern(codeOnly, /\bGetShortcut\s*\(\s*string/));
});
