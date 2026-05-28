import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';

export interface PerAssertion {
  name: string;
  passed: boolean;
  message?: string;
}

export interface GraderResult {
  pass: number;
  fail: number;
  stdout: string;
  stderr: string;
  perAssertion: PerAssertion[];
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
      // node:test summary lines: Node 22 uses `# pass N`, Node 24+ uses `ℹ pass N`.
      const passMatch = stdout.match(/^(?:#|ℹ) pass (\d+)/m);
      const failMatch = stdout.match(/^(?:#|ℹ) fail (\d+)/m);
      const pass = parseInt(passMatch?.[1] ?? '0', 10);
      const fail = parseInt(failMatch?.[1] ?? '0', 10);

      // Per-assertion: lines like `✔ assertion name (12ms)` or `✖ assertion name`.
      const perAssertion: PerAssertion[] = [];
      const lines = stdout.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(/^(\s*)(✔|✖|ok|not ok)\s+(?:\d+\s+)?(.+?)(?:\s+\(\d+(?:\.\d+)?ms\))?\s*$/);
        if (!m) continue;
        const passed = m[2] === '✔' || m[2] === 'ok';
        const name = m[3].trim();
        // Find an error message if this is a failure (look ahead a few lines).
        let message: string | undefined;
        if (!passed) {
          for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
            const errLine = lines[j].trim();
            if (errLine.startsWith('AssertionError') || errLine.startsWith('Error') || errLine.startsWith('message:')) {
              message = errLine; break;
            }
          }
        }
        perAssertion.push({ name, passed, message });
      }

      resolve({ pass, fail, stdout, stderr, perAssertion });
    });
    child.on('error', reject);
  });
}
