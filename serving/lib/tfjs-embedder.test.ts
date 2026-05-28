import { test } from 'node:test';
import assert from 'node:assert';
import { TfjsEmbedder } from './tfjs-embedder.ts';

test('embedder produces a 384-dim float32 vector', async (t) => {
  t.diagnostic('first call loads the model and tokenizer (~3-5s)');
  const embedder = new TfjsEmbedder();
  const vec = await embedder.embed('hello world');
  assert.equal(vec.length, 384);
  assert.ok(vec instanceof Float32Array);
});

test('embedder is deterministic across calls', async () => {
  const embedder = new TfjsEmbedder();
  const v1 = await embedder.embed('input system');
  const v2 = await embedder.embed('input system');
  assert.deepEqual(Array.from(v1), Array.from(v2));
});

test('related queries produce more similar vectors than unrelated ones', async () => {
  const embedder = new TfjsEmbedder();
  const related = cosine(
    await embedder.embed('handle keyboard input in Unity'),
    await embedder.embed('read player input in Unity'),
  );
  const unrelated = cosine(
    await embedder.embed('handle keyboard input in Unity'),
    await embedder.embed('photosynthesis in plants'),
  );
  assert.ok(related > unrelated, `expected related (${related}) > unrelated (${unrelated})`);
});

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
