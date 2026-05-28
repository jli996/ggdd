import { test } from 'node:test';
import assert from 'node:assert';
import { summarize, type RunResult } from './metrics.ts';

function r(guideId: string, agent: string, pass: number, fail: number, category: string): RunResult {
  return {
    guideId, agent, modelVersion: 'm',
    grader: { pass, fail, total: pass + fail, rate: pass / (pass + fail), perAssertion: [] },
    agentDurationMs: 1000, totalDurationMs: 1100, exitCode: 0,
    // @ts-expect-error attaching category for the per-cat aggregation
    category,
  };
}

test('summarize aggregates pass rates correctly', () => {
  const s = summarize([
    r('a', 'cc', 6, 0, 'unity-engine'),
    r('b', 'cc', 3, 3, 'unity-performance'),
    r('c', 'cc', 0, 6, 'unity-performance'),
  ]);
  assert.equal(s.runs, 3);
  // aggregate rate = (1.0 + 0.5 + 0.0) / 3 = 0.5
  assert.equal(s.aggregatePassRate, 0.5);
  assert.equal(s.byAgent['cc'].runs, 3);
  // unity-performance avg = (0.5 + 0) / 2 = 0.25
  assert.equal(s.byCategory['unity-performance'].passRate, 0.25);
});

test('summarize handles empty runs', () => {
  const s = summarize([]);
  assert.equal(s.runs, 0);
  assert.equal(s.aggregatePassRate, 0);
});
