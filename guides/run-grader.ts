import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';

export interface GraderResult {
  pass: number;
  fail: number;
  stdout: string;
  stderr: string;
}

export interface RunGraderOptions {
  /** Override the grader's TARGET_FILE env var (defaults to its demo/*). */
  target?: string;
  /** Wallclock timeout in ms. */
  timeoutMs?: number;
}

export async function runGrader(guideDir: string, opts: RunGraderOptions = {}): Promise<GraderResult> {
  const grader = path.join(guideDir, 'grader.ts');
  if (!fs.existsSync(grader)) throw new Error(`Grader not found: ${grader}`);

  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) env[k] = v;
  }
  // Clear NODE_TEST_CONTEXT so the child grader reports to its own stdout,
  // not to the parent test runner's IPC channel.
  delete env.NODE_TEST_CONTEXT;
  if (opts.target) env.TARGET_FILE = opts.target;

  return new Promise<GraderResult>((resolve, reject) => {
    const child = spawn(process.execPath, ['--experimental-strip-types', '--test', grader], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', (b: Buffer) => { stdout += b.toString(); });
    child.stderr.on('data', (b: Buffer) => { stderr += b.toString(); });

    const t = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`grader timed out (${opts.timeoutMs ?? 30000}ms)`)); }, opts.timeoutMs ?? 30000);

    child.on('close', () => {
      clearTimeout(t);
      // node:test summary lines: Node 18-22 uses `# pass N`, Node 23+ uses `ℹ pass N`.
      const pass = parseInt(stdout.match(/^(?:#|ℹ) pass (\d+)/m)?.[1] ?? '0', 10);
      const fail = parseInt(stdout.match(/^(?:#|ℹ) fail (\d+)/m)?.[1] ?? '0', 10);
      resolve({ pass, fail, stdout, stderr });
    });
    child.on('error', reject);
  });
}
