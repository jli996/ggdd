import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getVersion } from './version.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('getVersion reads version from nearest package.json', () => {
  const v = getVersion(__dirname);
  assert.match(v, /^\d+\.\d+\.\d+/);
});

test('getVersion finds the serving package.json (version 0.0.1)', () => {
  const v = getVersion(__dirname);
  assert.equal(v, '0.0.1');
});
