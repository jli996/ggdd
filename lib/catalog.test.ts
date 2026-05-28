import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { collectGuides } from './catalog.ts';

test('collectGuides returns parsed entries for every guide.md under guides/', () => {
  const entries = collectGuides();
  assert.ok(entries.length >= 12, `expected at least 12 guides, got ${entries.length}`);
  for (const e of entries) {
    assert.ok(e.id);
    assert.ok(e.category);
    assert.ok(e.guidePath.endsWith('guide.md'));
    assert.ok(e.dir);
  }
});

test('every collected guide has the expected on-disk siblings (demo, negative-demo, grader)', () => {
  const entries = collectGuides();
  for (const e of entries) {
    assert.ok(fs.existsSync(path.join(e.dir, 'expectations.md')), `${e.id}: missing expectations.md`);
    assert.ok(fs.existsSync(path.join(e.dir, 'grader.ts')), `${e.id}: missing grader.ts`);
    assert.ok(fs.existsSync(path.join(e.dir, 'demo')), `${e.id}: missing demo/`);
    assert.ok(fs.existsSync(path.join(e.dir, 'negative-demo')), `${e.id}: missing negative-demo/`);
  }
});
