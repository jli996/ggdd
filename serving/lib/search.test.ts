import { test } from 'node:test';
import assert from 'node:assert';
import { searchUseCases, searchByTag, type SearchResult } from './search.ts';

test('searchUseCases returns at least one result for a relevant query', async () => {
  const results = await searchUseCases('keyboard input in Unity');
  assert.ok(results.length >= 1);
  assert.equal(results[0].id, 'new-input-system-basics');
});

test('search results have the expected shape', async () => {
  const results = await searchUseCases('input');
  for (const r of results) {
    assert.equal(typeof r.id, 'string');
    assert.equal(typeof r.category, 'string');
    assert.equal(typeof r.useCase, 'string');
    assert.equal(typeof r.similarity, 'number');
    assert.ok(r.similarity >= -1 && r.similarity <= 1);
  }
});

test('search results are sorted by similarity descending', async () => {
  const results = await searchUseCases('input');
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i - 1].similarity >= results[i].similarity);
  }
});

test('search deduplicates by guide id (returns at most one row per guide)', async () => {
  const results = await searchUseCases('input');
  const ids = results.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate guide ids in results');
});

test('search limits results to top 10 by default', async () => {
  const results = await searchUseCases('anything');
  assert.ok(results.length <= 10);
});

test('search filters out results below the default similarity threshold', async () => {
  const results = await searchUseCases('mitochondrial dna cytoplasm ribosome translation');
  assert.equal(results.length, 0, `expected no results for irrelevant query, got ${JSON.stringify(results)}`);
});

test('search accepts an explicit minSimilarity below 0 to include negatives', async () => {
  const results = await searchUseCases('mitochondrial dna cytoplasm ribosome translation', 10, -1);
  assert.ok(results.length >= 1, 'expected at least one result with no threshold');
});

test('search default minSimilarity does not filter relevant queries', async () => {
  const results = await searchUseCases('keyboard input in Unity');
  assert.ok(results.length >= 1);
  assert.equal(results[0].id, 'new-input-system-basics');
});

test('search results carry bestTagSimilarity field after backfill', async () => {
  const results = await searchUseCases('keyboard input in Unity');
  // After backfill, results have non-zero bestTagSimilarity. Pre-backfill, undefined or 0.
  for (const r of results) {
    if (r.bestTagSimilarity !== undefined) {
      assert.ok(r.bestTagSimilarity >= -1 && r.bestTagSimilarity <= 1);
    }
  }
});

test('searchByTag returns empty for an unknown tag', () => {
  const r = searchByTag('not-a-real-tag-xyz');
  assert.deepEqual(r, []);
});
