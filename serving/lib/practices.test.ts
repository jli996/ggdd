import { test } from 'node:test';
import assert from 'node:assert';
import { listCatalog, findUseCaseById } from './practices.ts';

test('listCatalog returns one entry per guide (deduped by id)', () => {
  const catalog = listCatalog();
  assert.ok(catalog.length >= 1);
  const ids = catalog.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of catalog) {
    assert.equal(typeof c.id, 'string');
    assert.equal(typeof c.category, 'string');
    assert.equal(typeof c.description, 'string');
  }
});

test('findUseCaseById returns the entry for a known id', () => {
  const e = findUseCaseById('new-input-system-basics');
  assert.ok(e);
  assert.equal(e!.category, 'unity-engine');
});

test('findUseCaseById returns undefined for an unknown id', () => {
  assert.equal(findUseCaseById('does-not-exist'), undefined);
});
