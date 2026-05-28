export interface RunIndex {
  stamps: Array<{ stamp: string; files: string[] }>;
}

export interface RunResult {
  guideId: string;
  agent: string;
  modelVersion: string;
  grader: {
    pass: number;
    fail: number;
    total: number;
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

const BASE = `${(import.meta as any).env?.BASE_URL ?? '/'}data`;

export async function loadIndex(): Promise<RunIndex> {
  const r = await fetch(`${BASE}/index.json`);
  if (!r.ok) return { stamps: [] };
  return r.json();
}

export async function loadSummary(stamp: string): Promise<SuiteSummary | null> {
  const r = await fetch(`${BASE}/${stamp}/summary.json`);
  if (!r.ok) return null;
  return r.json();
}

export async function loadRun(stamp: string, agent: string, guideId: string): Promise<RunResult | null> {
  const r = await fetch(`${BASE}/${stamp}/${agent}-${guideId}.json`);
  if (!r.ok) return null;
  return r.json();
}

export async function loadAllRuns(stamp: string, index: RunIndex): Promise<RunResult[]> {
  const stampEntry = index.stamps.find(s => s.stamp === stamp);
  if (!stampEntry) return [];
  const out: RunResult[] = [];
  for (const file of stampEntry.files) {
    if (file === 'summary.json') continue;
    const r = await fetch(`${BASE}/${stamp}/${file}`);
    if (r.ok) out.push(await r.json());
  }
  return out;
}
