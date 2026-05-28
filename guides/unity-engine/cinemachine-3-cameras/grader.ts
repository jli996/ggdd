import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PlayerCamera.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('imports Unity.Cinemachine (CM3 namespace)', () => {
  assert.ok(usesNamespace(codeOnly, 'Unity.Cinemachine'));
});

test('does NOT import legacy Cinemachine (CM2 namespace)', () => {
  // The Cinemachine 2 import is `using Cinemachine;` (NOT Unity.Cinemachine).
  // A targeted regex catches that exact pattern without false-positives.
  assert.ok(hasNoPattern(codeOnly, /\busing\s+Cinemachine\s*;/));
});

test('uses CinemachineCamera type (CM3), not CinemachineVirtualCamera (CM2)', () => {
  assert.ok(hasPattern(codeOnly, /\bCinemachineCamera\b/));
  assert.ok(hasNoPattern(codeOnly, /\bCinemachineVirtualCamera\b/));
});

test('uses Priority to control camera switching (not transform manipulation)', () => {
  assert.ok(hasPattern(codeOnly, /\.Priority\s*=/));
});

test('does NOT manipulate Camera.transform directly', () => {
  assert.ok(hasNoPattern(codeOnly, /\b\w*[Cc]am\w*\.transform\.position\s*=/));
  assert.ok(hasNoPattern(codeOnly, /\b\w*[Cc]am\w*\.transform\.rotation\s*=/));
});
