import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ChunkGenerator.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('ScriptableObject with [CreateAssetMenu]', () => {
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu/));
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject\b/));
});

test('LevelChunk serializable inner class with 4 fields', () => {
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(declaresType(codeOnly, 'class', 'LevelChunk'));
  assert.ok(hasPattern(codeOnly, /\bchunkName\b/));
  assert.ok(hasPattern(codeOnly, /\bchunkPrefab\b/));
  assert.ok(hasPattern(codeOnly, /\bdifficultyTier\b/));
  assert.ok(hasPattern(codeOnly, /\bsecondsToTraverseAtBaseSpeed\b/));
});

test('chunkPool array field exists', () => {
  assert.ok(hasPattern(codeOnly, /LevelChunk\s*\[\s*\]\s+chunkPool\b/));
});

test('chunksPerRun > 0', () => {
  assert.ok(hasPattern(codeOnly, /\bchunksPerRun\b/));
  const match = codeOnly.match(/chunksPerRun\s*=\s*(\d+)/);
  assert.ok(match, 'chunksPerRun must have a numeric default');
  assert.ok(parseInt(match![1], 10) > 0, 'chunksPerRun must be > 0');
});

test('PickNextChunk(int) method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bPickNextChunk\s*\(\s*int\b/));
});
