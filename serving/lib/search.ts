import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { USE_CASES } from './use-cases.gen.ts';
import { readEmbeddingsBlob } from './corpus-io.ts';
import { TfjsEmbedder } from './tfjs-embedder.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOB_PATH = path.join(__dirname, 'embeddings.gen.bin');

export interface SearchResult {
  id: string;
  category: string;
  useCase: string;
  description: string;
  similarity: number;
}

let cached: { vectors: Float32Array[] } | null = null;
function loadCorpusVectors(): Float32Array[] {
  if (!cached) {
    const { vectors } = readEmbeddingsBlob(BLOB_PATH);
    cached = { vectors };
  }
  return cached.vectors;
}

const embedder = new TfjsEmbedder();

export async function searchUseCases(query: string, limit = 10): Promise<SearchResult[]> {
  if (USE_CASES.length === 0) return [];
  const vectors = loadCorpusVectors();
  const queryVec = await embedder.embed(query);

  const scored = USE_CASES.map(uc => ({
    id: uc.id,
    category: uc.category,
    useCase: uc.useCase,
    description: uc.description,
    similarity: dot(queryVec, vectors[uc.embeddingIndex]),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  // Dedupe by guide id, keeping the highest-scoring use-case row per guide.
  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const r of scored) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    deduped.push(r);
    if (deduped.length >= limit) break;
  }
  return deduped;
}

function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
