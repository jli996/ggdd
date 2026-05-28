import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn } from 'node:child_process';
import { DOMParser } from '@xmldom/xmldom';

export interface CompileError { message: string; }
export interface CompileResult { ok: boolean; errors: CompileError[]; stdout: string; stderr: string; }
export interface NUnitResult { name: string; outcome: 'Passed' | 'Failed' | 'Skipped'; message?: string; durationMs?: number; }

export interface UnityRunOpts {
  editorPath?: string;
  timeoutMs?: number;
  verbose?: boolean;
}

/** Resolve Unity 6 Editor binary path. Order: explicit > env > autodetect (Unity Hub install). */
export function resolveUnityEditor(opts: { explicit?: string } = {}): string | null {
  const candidates: string[] = [];
  if (opts.explicit) candidates.push(opts.explicit);
  if (process.env.UNITY_EDITOR_PATH) candidates.push(process.env.UNITY_EDITOR_PATH);

  if (process.platform === 'darwin') {
    const hubDir = path.join(os.homedir(), 'Applications', 'Unity', 'Hub', 'Editor');
    const sysHubDir = '/Applications/Unity/Hub/Editor';
    for (const root of [hubDir, sysHubDir]) {
      if (fs.existsSync(root)) {
        for (const v of fs.readdirSync(root).sort().reverse()) {
          if (!v.startsWith('6000.')) continue;
          candidates.push(path.join(root, v, 'Unity.app', 'Contents', 'MacOS', 'Unity'));
        }
      }
    }
  } else if (process.platform === 'win32') {
    const root = 'C:\\Program Files\\Unity\\Hub\\Editor';
    if (fs.existsSync(root)) {
      for (const v of fs.readdirSync(root).sort().reverse()) {
        if (!v.startsWith('6000.')) continue;
        candidates.push(path.join(root, v, 'Editor', 'Unity.exe'));
      }
    }
  } else {
    const root = path.join(os.homedir(), 'Unity', 'Hub', 'Editor');
    if (fs.existsSync(root)) {
      for (const v of fs.readdirSync(root).sort().reverse()) {
        if (!v.startsWith('6000.')) continue;
        candidates.push(path.join(root, v, 'Editor', 'Unity'));
      }
    }
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

interface SpawnResult { code: number; stdout: string; stderr: string; }

function spawnUnity(editor: string, args: string[], opts: UnityRunOpts): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(editor, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', (b: Buffer) => { stdout += b.toString(); if (opts.verbose) process.stdout.write(b); });
    child.stderr.on('data', (b: Buffer) => { stderr += b.toString(); if (opts.verbose) process.stderr.write(b); });
    const t = setTimeout(() => { child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 5000); reject(new Error(`Unity timed out (${opts.timeoutMs ?? 300000}ms)`)); }, opts.timeoutMs ?? 300000);
    child.on('close', code => { clearTimeout(t); resolve({ code: code ?? -1, stdout, stderr }); });
    child.on('error', err => { clearTimeout(t); reject(err); });
  });
}

/** Compile-only invocation. Returns {ok, errors} based on Unity's CompilerMessages in the log. */
export async function unityCompile(projectPath: string, opts: UnityRunOpts = {}): Promise<CompileResult> {
  const editor = resolveUnityEditor({ explicit: opts.editorPath });
  if (!editor) return { ok: false, errors: [{ message: 'Unity 6 Editor not found. Set UNITY_EDITOR_PATH or install via Unity Hub.' }], stdout: '', stderr: '' };
  if (!fs.existsSync(projectPath)) return { ok: false, errors: [{ message: `Project path not found: ${projectPath}` }], stdout: '', stderr: '' };

  const logFile = path.join(os.tmpdir(), `ggdd-unity-compile-${Date.now()}.log`);
  try {
    const args = ['-batchmode', '-nographics', '-projectPath', projectPath, '-quit', '-logFile', logFile];
    const r = await spawnUnity(editor, args, opts);
    const log = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : '';
    // Unity prints "error CS####" lines for compile errors.
    const errLines = log.split('\n').filter(l => /\berror (CS|UNT)\d+:/.test(l));
    const errors = errLines.map(l => ({ message: l.trim() }));
    return { ok: r.code === 0 && errors.length === 0, errors, stdout: r.stdout, stderr: r.stderr };
  } finally {
    try { fs.unlinkSync(logFile); } catch { /* ignore */ }
  }
}

export interface RunTestsOpts extends UnityRunOpts {
  /** Test platform: EditMode or PlayMode. */
  testPlatform?: 'EditMode' | 'PlayMode';
  /** Optional: only run tests in this asmdef. */
  assemblyNames?: string[];
}

/** Runs Unity Test Framework tests, returns parsed NUnit3 results. */
export async function unityRunTests(projectPath: string, opts: RunTestsOpts = {}): Promise<NUnitResult[]> {
  const editor = resolveUnityEditor({ explicit: opts.editorPath });
  if (!editor) throw new Error('Unity 6 Editor not found');

  const resultsXml = path.join(os.tmpdir(), `ggdd-unity-results-${Date.now()}.xml`);
  const logFile = path.join(os.tmpdir(), `ggdd-unity-tests-${Date.now()}.log`);
  try {
    const args: string[] = ['-batchmode', '-nographics', '-projectPath', projectPath, '-runTests',
      '-testPlatform', opts.testPlatform ?? 'EditMode', '-testResults', resultsXml,
      '-logFile', logFile];
    if (opts.assemblyNames?.length) {
      args.push('-assemblyNames'); args.push(opts.assemblyNames.join(';'));
    }
    await spawnUnity(editor, args, opts);
    if (!fs.existsSync(resultsXml)) {
      const log = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : '';
      throw new Error(`Unity did not produce test results. Log tail:\n${log.split('\n').slice(-40).join('\n')}`);
    }
    return parseNUnit3Xml(fs.readFileSync(resultsXml, 'utf8'));
  } finally {
    try { fs.unlinkSync(resultsXml); } catch { /* ignore */ }
    try { fs.unlinkSync(logFile); } catch { /* ignore */ }
  }
}

export function parseNUnit3Xml(xml: string): NUnitResult[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const cases = doc.getElementsByTagName('test-case');
  const out: NUnitResult[] = [];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    const outcome = (c.getAttribute('result') as 'Passed' | 'Failed' | 'Skipped') ?? 'Failed';
    const name = c.getAttribute('fullname') ?? c.getAttribute('name') ?? '<unnamed>';
    const durationAttr = c.getAttribute('duration');
    const durationMs = durationAttr ? Math.round(parseFloat(durationAttr) * 1000) : undefined;
    let message: string | undefined;
    const failures = c.getElementsByTagName('failure');
    if (failures.length > 0) {
      const m = failures[0].getElementsByTagName('message');
      if (m.length > 0) message = m[0].textContent ?? undefined;
    }
    out.push({ name, outcome, message, durationMs });
  }
  return out;
}
