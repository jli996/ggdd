import * as fs from 'node:fs';

export interface UseCaseEntry {
  id: string;
  category: 'unity-engine' | 'unity-performance' | 'game-design-action' | 'game-design-deckbuilder';
  description: string;
  useCase: string;
  embeddingIndex: number;
}

/**
 * Binary format for embeddings.gen.bin:
 *   uint32 LE — numVectors
 *   uint32 LE — vectorDim
 *   numVectors * vectorDim * 4 bytes — float32 LE, row-major
 */

export function readEmbeddingsBlob(filePath: string): {
  numVectors: number;
  vectorDim: number;
  vectors: Float32Array[];
} {
  const buf = fs.readFileSync(filePath);
  const numVectors = buf.readUInt32LE(0);
  const vectorDim = buf.readUInt32LE(4);
  const vectors: Float32Array[] = [];
  let off = 8;
  for (let v = 0; v < numVectors; v++) {
    const arr = new Float32Array(vectorDim);
    for (let i = 0; i < vectorDim; i++) {
      arr[i] = buf.readFloatLE(off);
      off += 4;
    }
    vectors.push(arr);
  }
  return { numVectors, vectorDim, vectors };
}

export async function writeEmbeddingsBlob(outPath: string, vectors: Float32Array[], vectorDim: number): Promise<void> {
  const header = Buffer.alloc(8);
  header.writeUInt32LE(vectors.length, 0);
  header.writeUInt32LE(vectorDim, 4);
  const body = Buffer.alloc(vectors.length * vectorDim * 4);
  let off = 0;
  for (const vec of vectors) {
    for (let i = 0; i < vectorDim; i++) {
      body.writeFloatLE(vec[i], off);
      off += 4;
    }
  }
  await fs.promises.writeFile(outPath, Buffer.concat([header, body]));
}
