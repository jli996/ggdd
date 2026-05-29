import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { buildGuides, readEmbeddingsBlob } from './build-guides.ts';

test('buildGuides walks a guides dir, writes use-cases.gen.ts and embeddings.gen.bin', async (t) => {
  const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ggdd-build-'));
  const guidesDir = path.join(tmp, 'guides');
  const outDir = path.join(tmp, 'out');
  await fs.promises.mkdir(path.join(guidesDir, 'unity-engine', 'demo-guide'), { recursive: true });
  await fs.promises.mkdir(outDir, { recursive: true });

  const guide = `---
id: demo-guide
category: unity-engine
title: Demo
description: A demo guide for tests.
useCases:
  - "test use case one"
  - "test use case two"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
tags:
  - modern-api
  - performance
  - unity-engine
---
Body.
`;
  await fs.promises.writeFile(path.join(guidesDir, 'unity-engine', 'demo-guide', 'guide.md'), guide);

  const result = await buildGuides({ guidesDir, outDir });
  assert.equal(result.numUseCases, 2);
  assert.equal(result.vectorDim, 384);
  assert.equal(result.numTags, 3);

  const ucPath = path.join(outDir, 'use-cases.gen.ts');
  const binPath = path.join(outDir, 'embeddings.gen.bin');
  assert.ok(fs.existsSync(ucPath));
  assert.ok(fs.existsSync(binPath));

  const generated = fs.readFileSync(ucPath, 'utf8');
  assert.match(generated, /id: "demo-guide"/);
  assert.match(generated, /useCase: "test use case one"/);
  assert.match(generated, /useCase: "test use case two"/);
  assert.match(generated, /tagIndices: \[\d/);

  const { numVectors, vectorDim, vectors } = readEmbeddingsBlob(binPath);
  assert.equal(numVectors, 2);
  assert.equal(vectorDim, 384);
  assert.equal(vectors.length, 2);
  assert.equal(vectors[0].length, 384);

  // Tag artifact assertions
  assert.ok(fs.existsSync(path.join(outDir, 'tag-index.gen.ts')));
  assert.ok(fs.existsSync(path.join(outDir, 'tag-embeddings.gen.bin')));
  const tagIdxSrc = fs.readFileSync(path.join(outDir, 'tag-index.gen.ts'), 'utf8');
  assert.match(tagIdxSrc, /"modern-api":\s*\d+/);
  const tagBlob = readEmbeddingsBlob(path.join(outDir, 'tag-embeddings.gen.bin'));
  assert.equal(tagBlob.numVectors, 3);
  assert.equal(tagBlob.vectorDim, 384);

  await fs.promises.rm(tmp, { recursive: true });
});
