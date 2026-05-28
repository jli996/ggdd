import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { testGrader } from './test-grader.ts';
import { rootDir } from '../lib/paths.ts';

test('testGrader passes for a properly calibrated guide', async () => {
  const ok = await testGrader(path.join(rootDir, 'guides', 'unity-engine', 'new-input-system-basics'));
  assert.equal(ok, true);
});
