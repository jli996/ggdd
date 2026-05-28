import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AgentRunner, AgentRunOpts, AgentRunResult } from '../lib/agent-shared.ts';
import type { Serving } from '../config.ts';

export const ClaudeCodeAgent: AgentRunner = {
  id: 'claude-code',
  defaultModel: 'claude-sonnet-4-6',

  async prepareSkill(workdir: string, _serving: Serving): Promise<void> {
    // Claude Code looks for .claude/CLAUDE.md per-project. Drop a tiny pointer
    // telling the agent to consult ggdd via npx.
    const claudeDir = path.join(workdir, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.writeFileSync(path.join(claudeDir, 'CLAUDE.md'),
      `For Unity guidance, use ggdd:\n` +
      `  npx ggdd@latest search "<query>"\n` +
      `  npx ggdd@latest retrieve "<id1>,<id2>"\n` +
      `Prefer modern Unity 6 APIs. Avoid \`UnityEngine.Input\`, Built-in RP, GameObject.FindObjectOfType in hot paths.\n`);
  },

  async run(opts: AgentRunOpts): Promise<AgentRunResult> {
    const start = Date.now();
    const promptFile = path.join(opts.workdir, '.ggdd-task-prompt.md');
    const fullPrompt = `${opts.prompt}\n\nFiles you may edit (workdir-relative):\n${opts.targetFiles.map(f => `  - ${f}`).join('\n')}\n`;
    fs.writeFileSync(promptFile, fullPrompt);

    return new Promise<AgentRunResult>((resolve, reject) => {
      // Invoke Claude Code in non-interactive ("print") mode.
      const child = spawn('claude', ['-p', '--dangerously-skip-permissions', `<${promptFile}`], {
        cwd: opts.workdir,
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env, CI: 'true' },
      });
      let stdout = '', stderr = '';
      child.stdout.on('data', (b: Buffer) => { stdout += b.toString(); });
      child.stderr.on('data', (b: Buffer) => { stderr += b.toString(); });
      const t = setTimeout(() => { child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 10_000); }, opts.timeoutMs);
      child.on('close', code => {
        clearTimeout(t);
        resolve({ exitCode: code ?? -1, stdout, stderr, durationMs: Date.now() - start });
      });
      child.on('error', reject);
    });
  },
};
