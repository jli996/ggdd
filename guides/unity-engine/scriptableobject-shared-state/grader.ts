import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'GameSettings.cs');
const src = readCSharp(TARGET);

test('declares class GameSettings', () => {
  assert.ok(declaresType(src, 'class', 'GameSettings'));
});

test('extends ScriptableObject (not MonoBehaviour)', () => {
  assert.ok(hasPattern(src, /GameSettings\s*:\s*ScriptableObject/));
  assert.ok(hasNoPattern(src, /GameSettings\s*:\s*MonoBehaviour/));
});

test('has a [CreateAssetMenu(...)] attribute', () => {
  assert.ok(hasPattern(src, /\[CreateAssetMenu\s*\(/));
});

test('no static Instance field', () => {
  assert.ok(hasNoPattern(src, /\bstatic\s+GameSettings\s+Instance\b/));
});

test('no DontDestroyOnLoad call', () => {
  assert.ok(hasNoPattern(src, /\bDontDestroyOnLoad\s*\(/));
});

test('declares at least one serialized field (musicVolume / sfxVolume / targetFrameRate)', () => {
  assert.ok(hasPattern(src, /\b(musicVolume|sfxVolume|targetFrameRate)\b/));
});
