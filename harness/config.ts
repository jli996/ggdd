import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs';

export const Serving = {
  CLI: 'cli',
  MCP: 'mcp',
  SKILLS_CLI: 'skills-cli',
} as const;
export type Serving = typeof Serving[keyof typeof Serving];

export type AgentId = 'claude-code' | 'codex-cli' | 'gemini-cli' | 'jetski-cli';

export interface SuiteConfig {
  serving: Serving;
  agents: AgentId[];
  /** Per-agent model override (optional). */
  models?: Partial<Record<AgentId, string>>;
  concurrency: number;
  /** Concurrent Unity-batch slots (gated separately from `concurrency`). */
  unitySlotCount: number;
  outputDir: string;
  unityEditorPath?: string;
  libraryCacheRoot?: string;
}

export interface ResolveOpts {
  configPath?: string;
}

const HARNESS_DIR = path.dirname(fileURLToPath(import.meta.url));

export async function resolveSuiteConfig(opts: ResolveOpts = {}): Promise<SuiteConfig> {
  const defaults: SuiteConfig = {
    serving: Serving.CLI,
    agents: ['claude-code'],
    concurrency: 4,
    unitySlotCount: 2,
    outputDir: path.resolve(HARNESS_DIR, 'runs'),
    unityEditorPath: process.env.UNITY_EDITOR_PATH,
    libraryCacheRoot: process.env.GGDD_LIBRARY_CACHE_ROOT,
  };

  if (opts.configPath && fs.existsSync(opts.configPath)) {
    const mod = await import(path.resolve(opts.configPath));
    return { ...defaults, ...(mod.default ?? mod) };
  }
  return defaults;
}
