import { test } from 'node:test';
import assert from 'node:assert';
import { auditGuides, devAll } from './dev-guide.ts';

test('auditGuides returns true when all 12 seed guides have full artifacts', async () => {
  const ok = await auditGuides({ verbose: false });
  assert.equal(ok, true);
});

test('devAll --test-grader passes for all 12 calibrated graders', async () => {
  const ok = await devAll({ verbose: false, testGraderOnly: true });
  assert.equal(ok, true);
});
