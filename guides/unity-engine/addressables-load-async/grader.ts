import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, usesNamespace, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'AssetLoader.cs');
const src = readCSharp(TARGET);

test('imports UnityEngine.AddressableAssets', () => {
  assert.ok(usesNamespace(src, 'UnityEngine.AddressableAssets'));
});

test('uses async loading API (LoadAssetAsync / InstantiateAsync / AssetReference)', () => {
  assert.ok(hasPattern(src, /\b(LoadAssetAsync|InstantiateAsync|AssetReference\w*)\b/));
});

test('awaits the handle or registers a Completed callback', () => {
  assert.ok(hasPattern(src, /\bawait\s+\w+\.Task\b|\.Completed\s*\+=/));
});

test('does not call Resources.Load / LoadAsync', () => {
  assert.ok(hasNoPattern(src, /\bResources\.(Load|LoadAsync|LoadAll)\s*[<(]/));
});

test('does not call AssetBundle.LoadFromFile or LoadAsset', () => {
  assert.ok(hasNoPattern(src, /\bAssetBundle\.(LoadFromFile|LoadAsset)\s*[<(]/));
});

test('releases the handle (Addressables.Release / ReleaseInstance)', () => {
  assert.ok(hasPattern(src, /\bAddressables\.(Release|ReleaseInstance)\b/));
});
