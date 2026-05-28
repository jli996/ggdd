import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'BulletSpawner.cs');
const src = readCSharp(TARGET);

test('imports UnityEngine.Pool', () => {
  assert.ok(usesNamespace(src, 'UnityEngine.Pool'));
});

test('declares an ObjectPool<...> field', () => {
  assert.ok(hasPattern(src, /\bObjectPool<\w+>\s+\w+\s*[;=]/));
});

test('initializes the pool with createFunc and action callbacks', () => {
  assert.ok(hasPattern(src, /createFunc\s*:/));
  assert.ok(hasPattern(src, /actionOnGet\s*:/));
  assert.ok(hasPattern(src, /actionOnRelease\s*:/));
});

test('Fire path uses pool.Get() instead of Instantiate', () => {
  const fire = src.match(/Fire\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
  if (fire) {
    assert.ok(/\.Get\s*\(\s*\)/.test(fire[1]),
      'Fire should call pool.Get(), not Instantiate');
    assert.ok(!/\bInstantiate\s*\(\s*bulletPrefab\b/.test(fire[1]),
      'Fire should not call Instantiate(bulletPrefab) directly');
  }
});

test('calls pool.Release somewhere in the file', () => {
  assert.ok(hasPattern(src, /\.Release\s*\(/));
});

test('no Destroy(bullet, time) timeout pattern', () => {
  assert.ok(hasNoPattern(src, /\bDestroy\s*\([^,)]+,\s*[0-9.]+f?\s*\)/));
});
