import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  readCSharp,
  hasPattern,
  hasNoPattern,
  usesNamespace,
  declaresType,
  methodCallsAst,
  serializedAssetField,
} from './test-fixture.ts';

function withTempCSharp(src: string, run: (filePath: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tfx-'));
  const p = path.join(dir, 'Test.cs');
  fs.writeFileSync(p, src);
  try { run(p); } finally { fs.rmSync(dir, { recursive: true }); }
}

const PLAYER_SRC = `using UnityEngine;
using UnityEngine.InputSystem;

namespace Game {
  public class PlayerController : MonoBehaviour {
    void Update() {
      var move = action.ReadValue<Vector2>();
      DoMove(move);
    }
    void DoMove(Vector2 v) {}
  }
}
`;

test('readCSharp returns the file contents', () => {
  withTempCSharp(PLAYER_SRC, (p) => {
    assert.match(readCSharp(p), /class PlayerController/);
  });
});

test('hasPattern / hasNoPattern detect substrings', () => {
  assert.ok(hasPattern(PLAYER_SRC, /ReadValue<Vector2>/));
  assert.ok(hasNoPattern(PLAYER_SRC, /Input\.GetAxis/));
});

test('usesNamespace detects "using X.Y" imports', () => {
  assert.ok(usesNamespace(PLAYER_SRC, 'UnityEngine.InputSystem'));
  assert.ok(!usesNamespace(PLAYER_SRC, 'System.Linq'));
});

test('declaresType finds class declarations', () => {
  assert.ok(declaresType(PLAYER_SRC, 'class', 'PlayerController'));
  assert.ok(!declaresType(PLAYER_SRC, 'class', 'Missing'));
});

test('methodCallsAst returns call count for a named method', () => {
  // Either tree-sitter or regex fallback should find DoMove called once.
  const r = methodCallsAst(PLAYER_SRC, 'DoMove');
  assert.ok(r.count >= 1, `expected DoMove call count >= 1, got ${r.count}`);
});

test('serializedAssetField reads top-level fields from a Unity YAML asset', () => {
  const yaml = `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!114 &11400000
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_Script: {fileID: 123, guid: abc}
  m_Name: SomeAsset
  m_EditorClassIdentifier:
  cardCost: 3
`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-'));
  const p = path.join(dir, 'Card.asset');
  fs.writeFileSync(p, yaml);
  try {
    assert.equal(serializedAssetField(p, 'MonoBehaviour.cardCost'), 3);
    assert.equal(serializedAssetField(p, 'MonoBehaviour.m_Name'), 'SomeAsset');
  } finally {
    fs.rmSync(dir, { recursive: true });
  }
});
