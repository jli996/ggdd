export interface RunResult {
  guideId: string;
  agent: string;
  modelVersion: string;
  grader: {
    pass: number;
    fail: number;
    total: number;
    /** Pass rate ∈ [0,1]. */
    rate: number;
    perAssertion: Array<{ name: string; passed: boolean; message?: string }>;
  };
  agentDurationMs: number;
  unityDurationMs?: number;
  totalDurationMs: number;
  costUsd?: number;
  exitCode: number;
}

export interface SuiteSummary {
  runs: number;
  aggregatePassRate: number;
  byCategory: Record<string, { runs: number; passRate: number }>;
  byAgent: Record<string, { runs: number; passRate: number }>;
}

export function summarize(runs: RunResult[]): SuiteSummary {
  if (runs.length === 0) return { runs: 0, aggregatePassRate: 0, byCategory: {}, byAgent: {} };
  const agg = runs.reduce((s, r) => s + r.grader.rate, 0) / runs.length;
  const byCategory: Record<string, { runs: number; passRate: number; sum: number }> = {};
  const byAgent: Record<string, { runs: number; passRate: number; sum: number }> = {};
  for (const r of runs) {
    // We approximate category from guideId by re-collecting; in real usage callers supply it.
    const cat = (r as any).category ?? 'unknown';
    byCategory[cat] ??= { runs: 0, passRate: 0, sum: 0 };
    byCategory[cat].runs++; byCategory[cat].sum += r.grader.rate;
    byAgent[r.agent] ??= { runs: 0, passRate: 0, sum: 0 };
    byAgent[r.agent].runs++; byAgent[r.agent].sum += r.grader.rate;
  }
  for (const k of Object.keys(byCategory)) byCategory[k].passRate = byCategory[k].sum / byCategory[k].runs;
  for (const k of Object.keys(byAgent)) byAgent[k].passRate = byAgent[k].sum / byAgent[k].runs;
  return {
    runs: runs.length,
    aggregatePassRate: agg,
    byCategory: Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, { runs: v.runs, passRate: v.passRate }])),
    byAgent: Object.fromEntries(Object.entries(byAgent).map(([k, v]) => [k, { runs: v.runs, passRate: v.passRate }])),
  };
}
