import { test } from 'node:test';
import assert from 'node:assert';
import { collectSuiteTasks } from './collection.ts';

test('collectSuiteTasks returns all 72 with no filter', () => {
  const t = collectSuiteTasks();
  assert.equal(t.length, 72);
  assert.ok(t.every(x => x.taskMd.length > 0));
});

test('collectSuiteTasks filters by id', () => {
  const t = collectSuiteTasks({ ids: ['new-input-system-basics'] });
  assert.equal(t.length, 1);
  assert.equal(t[0].guideId, 'new-input-system-basics');
});

test('collectSuiteTasks filters by category', () => {
  const t = collectSuiteTasks({ categories: ['game-design-action'] });
  assert.equal(t.length, 3);
});
