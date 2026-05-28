import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';
import { collectSuiteTasks, type SuiteTask } from './lib/collection.ts';
import type { AgentRunner } from './lib/agent-shared.ts';
import { ClaudeCodeAgent } from './agents/claude-code-agent.ts';
import { CodexCliAgent } from './agents/codex-cli-agent.ts';
import { GeminiCliAgent } from './agents/gemini-cli-agent.ts';
import { JetskiCliAgent } from './agents/jetski-cli-agent.ts';
import type { AgentId, Serving, SuiteConfig } from './config.ts';
import { writeRunResult, writeSuiteSummary, nowStamp } from './lib/reporting.ts';
import { summarize, type RunResult } from './lib/metrics.ts';
import { runGrader } from '../guides/run-grader.ts';

const AGENT_TABLE: Record<AgentId, AgentRunner> = {
  'claude-code': ClaudeCodeAgent,
  'codex-cli': CodexCliAgent,
  'gemini-cli': GeminiCliAgent,
  'jetski-cli': JetskiCliAgent,
};

export interface RunSuiteOpts {
  suiteConfig: SuiteConfig;
  tasks?: string[];
  timeoutMs?: number;
}

export async function runSuite(opts: RunSuiteOpts): Promise<{ runs: RunResult[]; summaryPath: string }> {
  const tasks = collectSuiteTasks(opts.tasks?.length ? { ids: opts.tasks } : undefined);
  if (tasks.length === 0) throw new Error('No tasks to run');

  const stamp = nowStamp();
  const runs: RunResult[] = [];

  for (const agentId of opts.suiteConfig.agents) {
    const agent = AGENT_TABLE[agentId];
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);

    for (const task of tasks) {
      try {
        const result = await runSingle(agent, task, opts.suiteConfig, opts.timeoutMs ?? 600_000);
        writeRunResult(opts.suiteConfig.outputDir, stamp, agentId, task.guideId, result);
        runs.push(result);
        console.log(`  ${agentId} × ${task.guideId}: ${result.grader.pass}/${result.grader.total} (rate=${result.grader.rate.toFixed(2)})`);
      } catch (err) {
        console.error(`  ${agentId} × ${task.guideId}: ERROR — ${(err as Error).message}`);
        runs.push({
          guideId: task.guideId, agent: agentId, modelVersion: agent.defaultModel,
          grader: { pass: 0, fail: 0, total: 0, rate: 0, perAssertion: [] },
          agentDurationMs: 0, totalDurationMs: 0, exitCode: -1,
        });
      }
    }
  }

  const summary = summarize(runs);
  const summaryPath = writeSuiteSummary(opts.suiteConfig.outputDir, stamp, summary);
  console.log(`\nSuite complete. Summary: ${summaryPath}`);
  return { runs, summaryPath };
}

async function runSingle(agent: AgentRunner, task: SuiteTask, cfg: SuiteConfig, timeoutMs: number): Promise<RunResult> {
  const startTotal = Date.now();
  // 1. Copy base-app to a unique working dir.
  const harnessDir = path.dirname(fileURLToPath(import.meta.url));
  const baseSrc = path.join(harnessDir, 'base_apps', task.baseApp);
  if (!fs.existsSync(baseSrc)) throw new Error(`Base app missing: ${baseSrc}`);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `ggdd-run-${task.guideId}-`));
  copyDirRecursive(baseSrc, work);

  // 2. Prepare the ggdd skill for this agent.
  await agent.prepareSkill(work, cfg.serving);

  // 3. Stage the demo .cs file as the agent's "starting point" (the file it should refactor).
  //    For Plan 4 v1 we drop the negative-demo as the start so the agent has actual broken code to fix.
  const negDir = path.join(task.guideDir, 'negative-demo');
  const negFile = fs.readdirSync(negDir).find(f => f.endsWith('.cs'));
  if (negFile) {
    const targetDir = path.join(work, 'Assets', 'Scripts');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(path.join(negDir, negFile), path.join(targetDir, negFile));
  }

  // 4. Spawn the agent with task.md + the target file path.
  const targetRel = negFile ? path.join('Assets/Scripts', negFile) : '';
  const agentStart = Date.now();
  const agentRes = await agent.run({
    workdir: work,
    prompt: task.taskMd,
    targetFiles: targetRel ? [targetRel] : [],
    timeoutMs,
  });
  const agentDurationMs = Date.now() - agentStart;

  // 5. Run the grader against the agent's modified file.
  const target = targetRel ? path.join(work, targetRel) : undefined;
  const grader = await runGrader(task.guideDir, { target });
  const total = grader.pass + grader.fail;

  return {
    guideId: task.guideId,
    agent: agent.id,
    modelVersion: agent.defaultModel,
    grader: {
      pass: grader.pass, fail: grader.fail, total,
      rate: total > 0 ? grader.pass / total : 0,
      perAssertion: [],
    },
    agentDurationMs,
    totalDurationMs: Date.now() - startTotal,
    exitCode: agentRes.exitCode,
  };
}

function copyDirRecursive(src: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'Library' || entry.name === 'Temp' || entry.name === 'Logs') continue;
    const s = path.join(src, entry.name), d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}
