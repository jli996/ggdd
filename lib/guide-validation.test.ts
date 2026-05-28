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
  }), GuideValidationError);
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
  });
  assert.deepEqual(valid.relatedGuides, ['object-pooling-basics']);
});
