import type { Serving } from '../config.ts';

export interface AgentRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  /** Path to a trajectory file (agent-specific format) if the runner writes one. */
  trajectoryPath?: string;
  costUsd?: number;
  durationMs: number;
}

export interface AgentRunOpts {
  /** Working directory the agent is launched in (the copied base-app). */
  workdir: string;
  /** Prompt content (the task.md body, possibly augmented with target-files list). */
  prompt: string;
  /** Files the agent is allowed (and expected) to edit, relative to workdir. */
  targetFiles: string[];
  /** Hard timeout in ms. */
  timeoutMs: number;
}

export interface AgentRunner {
  id: string;
  defaultModel: string;
  /** Prepare the ggdd skill in the agent's expected location for this workdir + serving mode. */
  prepareSkill(workdir: string, serving: Serving): Promise<void>;
  run(opts: AgentRunOpts): Promise<AgentRunResult>;
}

export class NotImplementedError extends Error {
  constructor(agentId: string) {
    super(`Agent runner "${agentId}" is not implemented in Plan 4. See CONTEXT.md TODO.`);
    this.name = 'NotImplementedError';
  }
}
