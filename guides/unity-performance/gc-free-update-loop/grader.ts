import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, methodCallsAst, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EnemyAI.cs');
const src = readCSharp(TARGET);

test('does not import System.Linq', () => {
  assert.ok(!usesNamespace(src, 'System.Linq'));
});

test('GetComponent is called in Awake or Start, not in a hot loop', () => {
  // Strict-but-fair: total GetComponent call count <= 1 (the cache in Awake/Start).
  const calls = methodCallsAst(src, 'GetComponent');
  assert.ok(calls.count <= 1, `expected at most 1 GetComponent call, got ${calls.count}`);
});

test('no new List<...> / new ...[] inside FixedUpdate', () => {
  // Find FixedUpdate body and check it doesn't allocate common types.
  const fixedUpdate = src.match(/void\s+FixedUpdate\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
  if (fixedUpdate) {
    const body = fixedUpdate[1];
    assert.ok(!/\bnew\s+List<|\bnew\s+Dictionary<|\bnew\s+\w+\[/.test(body),
      `FixedUpdate allocates: ${body.match(/\bnew\s+\S+/g)?.join(', ')}`);
  }
});

test('uses NonAlloc Physics overload (or no allocating Overlap call)', () => {
  if (hasPattern(src, /\bPhysics(?:2D)?\.Overlap/)) {
    assert.ok(hasPattern(src, /OverlapCircleNonAlloc|OverlapBoxNonAlloc|OverlapSphereNonAlloc/),
      'Used Overlap* but not the NonAlloc variant');
  }
});

test('no Debug.Log inside FixedUpdate', () => {
  const fixedUpdate = src.match(/void\s+FixedUpdate\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
  if (fixedUpdate) {
    assert.ok(!/\bDebug\.(Log|LogWarning|LogError)\b/.test(fixedUpdate[1]));
  }
});
