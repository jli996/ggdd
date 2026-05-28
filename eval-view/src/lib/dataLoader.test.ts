import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadIndex, loadRun, loadSummary, loadAllRuns } from './dataLoader.ts';

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('dataLoader', () => {
  it('loadIndex returns empty stamps when fetch 404s', async () => {
    vi.stubGlobal('fetch', async () => new Response(null, { status: 404 }));
    const idx = await loadIndex();
    expect(idx.stamps).toEqual([]);
  });

  it('loadIndex parses successful response', async () => {
    const data = { stamps: [{ stamp: '20260528-100000', files: ['summary.json', 'claude-code-foo.json'] }] };
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify(data), { status: 200 }));
    expect(await loadIndex()).toEqual(data);
  });

  it('loadSummary returns null on miss', async () => {
    vi.stubGlobal('fetch', async () => new Response(null, { status: 404 }));
    expect(await loadSummary('20260528')).toBeNull();
  });

  it('loadRun reads the per-run JSON', async () => {
    const run = { guideId: 'foo', agent: 'claude-code', modelVersion: 'm', grader: { pass: 5, fail: 1, total: 6, rate: 5/6, perAssertion: [] }, agentDurationMs: 0, totalDurationMs: 0, exitCode: 0 };
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify(run), { status: 200 }));
    expect(await loadRun('20260528', 'claude-code', 'foo')).toEqual(run);
  });

  it('loadAllRuns excludes summary.json and returns parsed entries', async () => {
    const idx = { stamps: [{ stamp: 's', files: ['summary.json', 'a.json', 'b.json'] }] };
    const calls: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => {
      calls.push(url);
      return new Response(JSON.stringify({ guideId: url, agent: 'x', modelVersion: 'y', grader: { pass: 1, fail: 0, total: 1, rate: 1, perAssertion: [] }, agentDurationMs: 0, totalDurationMs: 0, exitCode: 0 }), { status: 200 });
    });
    const runs = await loadAllRuns('s', idx);
    expect(runs.length).toBe(2);
    expect(calls.find(c => c.endsWith('/summary.json'))).toBeUndefined();
  });
});
