import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'MainMenu.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('imports UnityEngine.UIElements (UI Toolkit)', () => {
  assert.ok(usesNamespace(codeOnly, 'UnityEngine.UIElements'));
});

test('does NOT import UnityEngine.UI (uGUI)', () => {
  assert.ok(!usesNamespace(codeOnly, 'UnityEngine.UI'));
});

test('references UIDocument', () => {
  assert.ok(hasPattern(codeOnly, /\bUIDocument\b/));
});

test('uses rootVisualElement.Q<...>() for element lookup', () => {
  assert.ok(hasPattern(codeOnly, /\.rootVisualElement\b/));
  assert.ok(hasPattern(codeOnly, /\.Q<\w+>\s*\(/));
});

test('does NOT use uGUI .onClick.AddListener pattern', () => {
  assert.ok(hasNoPattern(codeOnly, /\.onClick\.AddListener\s*\(/));
});

test('subscribes via .clicked += and unsubscribes via .clicked -=', () => {
  assert.ok(hasPattern(codeOnly, /\.clicked\s*\+=/));
  assert.ok(hasPattern(codeOnly, /\.clicked\s*-=/));
});
