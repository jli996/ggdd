import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PlayerNetwork.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('imports Unity.Netcode', () => {
  assert.ok(usesNamespace(codeOnly, 'Unity.Netcode'));
});

test('extends NetworkBehaviour (not MonoBehaviour)', () => {
  assert.ok(hasPattern(codeOnly, /\bPlayerNetwork\s*:\s*NetworkBehaviour\b/));
  assert.ok(hasNoPattern(codeOnly, /\bPlayerNetwork\s*:\s*MonoBehaviour\b/));
});

test('uses NetworkVariable<T> for synced state', () => {
  assert.ok(hasPattern(codeOnly, /\bNetworkVariable<\w+>/));
});

test('has at least one [ServerRpc] method ending with ServerRpc', () => {
  assert.ok(hasPattern(codeOnly, /\[ServerRpc\]/));
  assert.ok(hasPattern(codeOnly, /\bvoid\s+\w+ServerRpc\s*\(/));
});

test('has at least one [ClientRpc] method ending with ClientRpc', () => {
  assert.ok(hasPattern(codeOnly, /\[ClientRpc\]/));
  assert.ok(hasPattern(codeOnly, /\bvoid\s+\w+ClientRpc\s*\(/));
});

test('does NOT import System.Net.Sockets', () => {
  assert.ok(!usesNamespace(codeOnly, 'System.Net.Sockets'));
});
