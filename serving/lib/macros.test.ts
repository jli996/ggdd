import { test } from 'node:test';
import assert from 'node:assert';
import { expandIncludes } from './macros.ts';

test('expandIncludes returns content unchanged when no directives present', () => {
  const src = '# Title\n\nBody.';
  assert.equal(expandIncludes(src, '/tmp/whatever.md'), src);
});

test('expandIncludes resolves !include relative to the source file', async (t) => {
  const tmp = await import('node:os').then(o => o.tmpdir());
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(tmp, 'inc-'));
  fs.writeFileSync(path.join(dir, 'shared.md'), 'SHARED CONTENT');
  const main = `Header\n\n!include shared.md\n\nFooter`;
  fs.writeFileSync(path.join(dir, 'main.md'), main);
  const result = expandIncludes(main, path.join(dir, 'main.md'));
  assert.match(result, /SHARED CONTENT/);
  assert.match(result, /Header/);
  assert.match(result, /Footer/);
  fs.rmSync(dir, { recursive: true });
});

test('expandIncludes throws on missing include target', () => {
  assert.throws(() => expandIncludes('!include does-not-exist.md', '/tmp/main.md'));
});
