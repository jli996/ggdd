import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import {
  readCSharp, usesNamespace, hasPattern, hasNoPattern, declaresType,
} from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PlayerController.cs');
const src = readCSharp(TARGET);

test('imports UnityEngine.InputSystem', () => {
  assert.ok(usesNamespace(src, 'UnityEngine.InputSystem'));
});

test('declares a serialized InputActionAsset or InputAction', () => {
  assert.ok(hasPattern(src, /\b(InputActionAsset|InputAction)\b/));
});

test('reads via ReadValue<...>() or action.performed', () => {
  assert.ok(hasPattern(src, /\.ReadValue<\w+>\(\)|action\.performed/));
});

test('no legacy Input.GetAxis / GetKey / GetButton / GetMouseButton calls', () => {
  assert.ok(hasNoPattern(src, /\bInput\.GetAxis\b/));
  assert.ok(hasNoPattern(src, /\bInput\.GetKey\b/));
  assert.ok(hasNoPattern(src, /\bInput\.GetButton\b/));
  assert.ok(hasNoPattern(src, /\bInput\.GetMouseButton\b/));
});

test('no System.Linq import', () => {
  assert.ok(hasNoPattern(src, /\busing\s+System\.Linq\s*;/));
});

test('declares PlayerController : MonoBehaviour', () => {
  assert.ok(declaresType(src, 'class', 'PlayerController'));
  assert.ok(hasPattern(src, /PlayerController\s*:\s*MonoBehaviour/));
});
