import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { describe, it, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { type UseCaseEntry, readEmbeddingsBlob, writeEmbeddingsBlob } from './corpus-io.ts';

describe('corpus-io round-trip', () => {
  let tmpDir: string;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-io-test-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writeEmbeddingsBlob then readEmbeddingsBlob reproduces identical vectors', async () => {
    const vectorDim = 4;
    const vectors: Float32Array[] = [
      new Float32Array([0.1, 0.2, 0.3, 0.4]),
      new Float32Array([0.5, 0.6, 0.7, 0.8]),
      new Float32Array([-1.0, 0.0, 1.0, 0.5]),
    ];

    const outPath = path.join(tmpDir, 'embeddings.bin');
    await writeEmbeddingsBlob(outPath, vectors, vectorDim);

    const { numVectors, vectorDim: dim, vectors: readVectors } = readEmbeddingsBlob(outPath);

    assert.equal(numVectors, vectors.length, 'numVectors should match');
    assert.equal(dim, vectorDim, 'vectorDim should match');
    assert.equal(readVectors.length, vectors.length, 'number of vectors should match');

    for (let v = 0; v < vectors.length; v++) {
      for (let i = 0; i < vectorDim; i++) {
        assert.ok(
          Math.abs(readVectors[v][i] - vectors[v][i]) < 1e-6,
          `vector[${v}][${i}]: expected ${vectors[v][i]}, got ${readVectors[v][i]}`,
        );
      }
    }
  });

  it('reads correct header values (numVectors, vectorDim)', async () => {
    const vectors = [new Float32Array([1, 2, 3]), new Float32Array([4, 5, 6])];
    const outPath = path.join(tmpDir, 'embeddings2.bin');
    await writeEmbeddingsBlob(outPath, vectors, 3);

    const result = readEmbeddingsBlob(outPath);
    assert.equal(result.numVectors, 2);
    assert.equal(result.vectorDim, 3);
  });
});

test('UseCaseEntry includes tagIndices field', () => {
  const entry: UseCaseEntry = {
    id: 'x', category: 'unity-engine', description: 'd', useCase: 'u', embeddingIndex: 0, tagIndices: [3, 7],
  };
  assert.deepEqual(entry.tagIndices, [3, 7]);
});
