import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { USE_CASES } from './use-cases.gen.ts';
import { TAG_INDEX, TAGS } from './tag-index.gen.ts';
import { readEmbeddingsBlob } from './corpus-io.ts';
import { TfjsEmbedder } from './tfjs-embedder.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOB_PATH = path.join(__dirname, 'embeddings.gen.bin');
const TAG_BLOB_PATH = path.join(__dirname, 'tag-embeddings.gen.bin');

export interface SearchResult {
  id: string;
  category: string;
  useCase: string;
  description: string;
  similarity: number;
  /** The single best query-vs-tag similarity for this guide. Useful for debugging. */
  bestTagSimilarity?: number;
}

let useCaseCache: { vectors: Float32Array[] } | null = null;
let tagCache: { vectors: Float32Array[] } | null = null;

function loadCorpusVectors(): Float32Array[] {
  if (!useCaseCache) {
    const { vectors } = readEmbeddingsBlob(BLOB_PATH);
    useCaseCache = { vectors };
  }
  return useCaseCache.vectors;
}

function loadTagVectors(): Float32Array[] {
  if (!tagCache) {
    if (!fs.existsSync(TAG_BLOB_PATH)) { tagCache = { vectors: [] }; return tagCache.vectors; }
    const { vectors } = readEmbeddingsBlob(TAG_BLOB_PATH);
    tagCache = { vectors };
  }
  return tagCache.vectors;
}

const embedder = new TfjsEmbedder();

export interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
  tagBoostWeight?: number;
}

export async function searchUseCases(
  query: string,
  limit = 10,
  minSimilarity = 0.45,
  tagBoostWeight = 0.15,
): Promise<SearchResult[]> {
  if (USE_CASES.length === 0) return [];
  const useCaseVectors = loadCorpusVectors();
  const tagVectors = loadTagVectors();
  const queryVec = await embedder.embed(query);

  // Tag boost floor: only credit a guide's best tag match when it's genuinely
  // relevant. Below this floor, the tag is noise. Calibrated so brand-name
  // queries ("league of legend" → moba tag sim ≈ 0.41) get credit while
  // semantic spillover (match-3 query → moba tag sim ≈ 0.34) does not.
  const TAG_BOOST_FLOOR = 0.40;

  // Missing-tag penalty: if the query strongly indicates a specific tag (e.g.
  // "match 3 game design" → `match-3` at 0.72), guides that DON'T carry that
  // tag get penalized. Prevents semantic-token spillover from putting unrelated
  // guides (e.g. MOBA's three-phase-game-arc) in match-3 results.
  const STRONG_QUERY_TAG_THRESHOLD = 0.55;
  const MISSING_TAG_PENALTY = 0.12;

  // Identify the single tag most strongly indicated by the query.
  let bestQueryTagSim = 0;
  let bestQueryTagIdx = -1;
  for (let i = 0; i < tagVectors.length; i++) {
    const sim = dot(queryVec, tagVectors[i]);
    if (sim > bestQueryTagSim) {
      bestQueryTagSim = sim;
      bestQueryTagIdx = i;
    }
  }
  const queryHasStrongTagSignal = bestQueryTagSim >= STRONG_QUERY_TAG_THRESHOLD && bestQueryTagIdx >= 0;

  const scored: SearchResult[] = USE_CASES.map(uc => {
    const semanticSim = dot(queryVec, useCaseVectors[uc.embeddingIndex]);
    // Max-over-tags: reward strong tag matches without diluting by tag count.
    let bestTagSim = 0;
    for (const tagIdx of (uc.tagIndices ?? [])) {
      if (tagIdx < 0 || tagIdx >= tagVectors.length) continue;
      const tagSim = dot(queryVec, tagVectors[tagIdx]);
      if (tagSim > bestTagSim) bestTagSim = tagSim;
    }
    const effectiveTagBoost = bestTagSim >= TAG_BOOST_FLOOR ? bestTagSim * tagBoostWeight : 0;

    // Penalize guides missing the query's strongly-indicated tag.
    let penalty = 0;
    if (queryHasStrongTagSignal && !(uc.tagIndices ?? []).includes(bestQueryTagIdx)) {
      penalty = MISSING_TAG_PENALTY;
    }

    const finalSim = semanticSim + effectiveTagBoost - penalty;
    return {
      id: uc.id, category: uc.category, useCase: uc.useCase, description: uc.description,
      similarity: finalSim,
      bestTagSimilarity: tagVectors.length > 0 ? bestTagSim : undefined,
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const r of scored) {
    if (r.similarity < minSimilarity) break;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    deduped.push(r);
    if (deduped.length >= limit) break;
  }
  return deduped;
}

/** Strict tag filter — returns all guides that carry the given tag (unsorted by relevance, deduped by guide id). */
export function searchByTag(tag: string, limit = 50): SearchResult[] {
  const tagIdx = TAG_INDEX[tag];
  if (tagIdx === undefined) return [];
  const seen = new Set<string>();
  const out: SearchResult[] = [];
  for (const uc of USE_CASES) {
    if (!(uc.tagIndices ?? []).includes(tagIdx)) continue;
    if (seen.has(uc.id)) continue;
    seen.add(uc.id);
    out.push({ id: uc.id, category: uc.category, useCase: uc.useCase, description: uc.description, similarity: 1 });
    if (out.length >= limit) break;
  }
  return out;
}

// Re-export TAGS for consumers that only need the tag list
export { TAGS };

function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
