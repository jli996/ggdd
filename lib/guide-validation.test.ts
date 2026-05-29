import { test } from 'node:test';
import assert from 'node:assert';
import { parseGuide, validateFrontmatter, GuideValidationError } from './guide-validation.ts';

const VALID_GUIDE = `---
id: gc-free-update-loop
category: unity-performance
title: GC-free Update() loops
description: Prevents per-frame heap allocations.
useCases:
  - "avoid GC spikes in Update"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
tags:
  - modern-api
  - performance
  - unity-engine
---

Body content here.
`;

test('parseGuide extracts frontmatter and body', () => {
  const parsed = parseGuide(VALID_GUIDE);
  assert.equal(parsed.frontmatter.id, 'gc-free-update-loop');
  assert.equal(parsed.frontmatter.category, 'unity-performance');
  assert.equal(parsed.body.trim(), 'Body content here.');
});

test('validateFrontmatter accepts a complete frontmatter object', () => {
  const parsed = parseGuide(VALID_GUIDE);
  const validated = validateFrontmatter(parsed.frontmatter);
  assert.equal(validated.id, 'gc-free-update-loop');
  assert.deepEqual(validated.useCases, ['avoid GC spikes in Update']);
  assert.equal(validated.gradeMode, 'static');
});

test('validateFrontmatter rejects missing required field', () => {
  assert.throws(
    () => validateFrontmatter({ id: 'x', category: 'unity-performance' }),
    GuideValidationError,
  );
});

test('validateFrontmatter rejects invalid gradeMode', () => {
  assert.throws(() => validateFrontmatter({
    id: 'x',
    category: 'unity-performance',
    title: 'T',
    description: 'D',
    useCases: ['u'],
    gradeMode: 'not-a-mode',
    unityVersion: '6000.0',
    baseApp: 'empty-unity6',
    tags: ['modern-api', 'performance', 'unity-engine'],
  }), GuideValidationError);
});

test('validateFrontmatter accepts the new v2 categories', () => {
  for (const cat of [
    'game-design-shooter-survival',
    'game-design-shooter-extraction',
    'game-design-shooter-competitive',
    'game-design-shooter-singleplayer',
    'game-design-platformer-precision',
    'game-design-platformer-momentum',
    'game-design-platformer-3d-collectathon',
    'game-design-soulslike',
    'game-design-ai-perception',
    'game-design-rts-classic',
    'game-design-moba',
    'game-design-mmorts',
  ] as const) {
    const valid = validateFrontmatter({
      id: 'x', category: cat, title: 'T', description: 'D', useCases: ['u'],
      gradeMode: 'static', unityVersion: '6000.0', baseApp: 'empty-unity6',
      tags: ['modern-api', 'performance', 'unity-engine'],
    });
    assert.equal(valid.category, cat);
  }
});

test('validateFrontmatter accepts the new Plan 8 casual genre categories', () => {
  for (const cat of [
    'game-design-casual-match-3',
    'game-design-casual-merge-2',
    'game-design-casual-color-sort',
    'game-design-casual-lane-switch',
    'game-design-casual-clicker-idle',
    'game-design-casual-hyper-casual',
    'game-design-casual-endless-runner',
  ] as const) {
    const valid = validateFrontmatter({
      id: 'x', category: cat, title: 'T', description: 'D', useCases: ['u'],
      gradeMode: 'static', unityVersion: '6000.0', baseApp: 'empty-unity6',
      tags: ['casual', 'mobile', 'puzzle'],
    });
    assert.equal(valid.category, cat);
  }
});

test('validateFrontmatter accepts optional relatedGuides + appliesTo', () => {
  const valid = validateFrontmatter({
    id: 'x',
    category: 'unity-performance',
    title: 'T',
    description: 'D',
    useCases: ['u'],
    gradeMode: 'static+unity',
    unityVersion: '6000.0',
    baseApp: 'empty-unity6',
    relatedGuides: ['object-pooling-basics'],
    appliesTo: ['MonoBehaviour scripts'],
    tags: ['modern-api', 'forgiving-input', 'unity-engine'],
  });
  assert.deepEqual(valid.relatedGuides, ['object-pooling-basics']);
});

test('validateFrontmatter accepts a tags array', () => {
  const valid = validateFrontmatter({
    id: 'x', category: 'unity-engine', title: 'T', description: 'D', useCases: ['u'],
    gradeMode: 'static', unityVersion: '6000.0', baseApp: 'empty-unity6',
    tags: ['modern-api', 'forgiving-input', 'unity-engine'],
  });
  assert.deepEqual(valid.tags, ['modern-api', 'forgiving-input', 'unity-engine']);
});

test('validateFrontmatter rejects fewer than 3 tags', () => {
  assert.throws(() => validateFrontmatter({
    id: 'x', category: 'unity-engine', title: 'T', description: 'D', useCases: ['u'],
    gradeMode: 'static', unityVersion: '6000.0', baseApp: 'empty-unity6',
    tags: ['only-one', 'two-tags'],
  }), GuideValidationError);
});

test('validateFrontmatter rejects invalid tag name format', () => {
  assert.throws(() => validateFrontmatter({
    id: 'x', category: 'unity-engine', title: 'T', description: 'D', useCases: ['u'],
    gradeMode: 'static', unityVersion: '6000.0', baseApp: 'empty-unity6',
    tags: ['Camel-Case', 'okay-tag', 'another-tag'],
  }), GuideValidationError);
});
