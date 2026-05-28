# ggdd Plan 4 — Eval Harness + Unity Base Apps

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (or executing-plans). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship the `harness/` package — Unity-batch-mode runner, agent runners, suite orchestration, metrics, reporting — plus one real Unity 6 base-app (`empty-unity6`) committed via git LFS. Wire `ggdd-dev eval`, `run`, `warm-cache`, and friends so a real coding agent can be evaluated against a guide end-to-end.

**Architecture:** `harness/` is a new pnpm-workspace package, private. `harness/lib/unity-runner.ts` finds Unity 6 Editor (env > config > autodetect), spawns batch-mode subprocess for compile/EditMode tests, parses NUnit3 XML. `harness/agents/` wraps coding-agent CLIs (claude-code primary; codex/gemini/jetski stubbed). `harness/run_suite.ts` orchestrates: copy base-app → symlink Library cache → spawn agent with the ggdd skill → run grader → write result JSON. The `negative/` base-app is a tiny C# folder used to verify graders fail in the absence of any code.

**Tech Stack:** Node 22+, npm (not pnpm — CONTEXT.md), Unity 6 Editor (`6000.3.11f1` at `/Applications/Unity/Hub/Editor/`), `xmldom` for NUnit XML parsing, Claude Code CLI for the primary agent runner (we're running inside it). LFS for base-app binary assets.

**Branch:** `feature/plan-4-eval-harness` (off `main`, after PR #3 merged at `fb13f51`).

---

## File map

```
/Users/lijinglue/repo/ggdd/
├── pnpm-workspace.yaml                          # MODIFY (add harness)
├── package.json                                  # MODIFY (add xmldom devDep)
├── harness/
│   ├── package.json                              # NEW (private workspace)
│   ├── config.ts                                 # NEW — Serving enum, SuiteConfig, resolveSuiteConfig
│   ├── config.test.ts                            # NEW
│   ├── lib/
│   │   ├── unity-runner.ts                       # NEW — Unity batch wrapper
│   │   ├── unity-runner.test.ts                  # NEW (skips if UNITY_EDITOR_PATH unset)
│   │   ├── agent-shared.ts                       # NEW — AgentRunner interface
│   │   ├── collection.ts                         # NEW — pick guides for a suite
│   │   ├── collection.test.ts                    # NEW
│   │   ├── metrics.ts                            # NEW — aggregate per-run stats
│   │   ├── metrics.test.ts                       # NEW
│   │   └── reporting.ts                          # NEW — write result JSON
│   ├── agents/
│   │   ├── claude-code-agent.ts                  # NEW — primary impl
│   │   ├── codex-cli-agent.ts                    # NEW — stub
│   │   ├── gemini-cli-agent.ts                   # NEW — stub
│   │   └── jetski-cli-agent.ts                   # NEW — stub
│   ├── run_suite.ts                              # NEW — orchestration
│   ├── evaluate.ts                               # NEW — entrypoint for `ggdd-dev eval`
│   ├── quick-smoke.ts                            # NEW — single-task smoke
│   ├── backfill.ts                               # NEW — recompute metrics from past runs (skeleton)
│   ├── upload_suite.ts                           # NEW — GCS upload skeleton (no-op without GGDD_GCS_BUCKET)
│   └── base_apps/
│       ├── empty-unity6/                         # NEW Unity 6 project (LFS for binaries)
│       │   ├── .gitignore
│       │   ├── Assets/
│       │   ├── Packages/manifest.json
│       │   ├── ProjectSettings/ProjectVersion.txt
│       │   └── README.md
│       ├── brawler-skeleton/README.md            # NEW — placeholder w/ instructions
│       ├── deckbuilder-skeleton/README.md        # NEW — placeholder w/ instructions
│       └── negative/                             # NEW — tiny C# folder
│           └── EnemyAI.cs
├── bin/ggdd-dev.ts                               # MODIFY (wire eval/run/warm-cache/backfill/upload/dashboard/deploy)
├── guides/unity-performance/gc-free-update-loop/guide.md   # MODIFY — switch to gradeMode: static+unity
└── CONTEXT.md                                    # MODIFY (Plan 4 scope notes)
```

---

## Task 1: Harness package skeleton

**Files:** `pnpm-workspace.yaml`, `package.json` (root), `harness/package.json`, `harness/config.ts` + test.

- [ ] **Step 1: Add `harness` to pnpm-workspace.yaml**

```yaml
packages:
  - "serving"
  - "harness"
```

- [ ] **Step 2: Add `@xmldom/xmldom` to root devDeps**

```bash
cd /Users/lijinglue/repo/ggdd
npm install --ignore-scripts --no-audit --no-fund --save-dev @xmldom/xmldom@^0.8.10
```

- [ ] **Step 3: Create `harness/package.json`**

```json
{
  "name": "harness",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test --experimental-strip-types --test-timeout 60000 '**/*.test.ts'",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@xmldom/xmldom": "^0.8.10"
  }
}
```

- [ ] **Step 4: Write failing test for `config.ts`**

`harness/config.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { Serving, resolveSuiteConfig } from './config.ts';

test('Serving enum exposes CLI, MCP, SKILLS_CLI', () => {
  assert.equal(Serving.CLI, 'cli');
  assert.equal(Serving.MCP, 'mcp');
  assert.equal(Serving.SKILLS_CLI, 'skills-cli');
});

test('resolveSuiteConfig returns defaults with no arguments', async () => {
  const c = await resolveSuiteConfig();
  assert.equal(c.serving, Serving.CLI);
  assert.ok(Array.isArray(c.agents));
  assert.ok(c.agents.includes('claude-code'));
  assert.equal(c.concurrency, 4);
  assert.equal(c.unitySlotCount, 2);
});

test('resolveSuiteConfig honors env overrides', async () => {
  process.env.UNITY_EDITOR_PATH = '/some/path/Unity';
  const c = await resolveSuiteConfig();
  assert.equal(c.unityEditorPath, '/some/path/Unity');
  delete process.env.UNITY_EDITOR_PATH;
});
```

- [ ] **Step 5: Implement `harness/config.ts`**

```typescript
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs';

export enum Serving {
  CLI = 'cli',
  MCP = 'mcp',
  SKILLS_CLI = 'skills-cli',
}

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
```

- [ ] **Step 6: Install + verify**

```bash
cd /Users/lijinglue/repo/ggdd
npm install --ignore-scripts --no-audit --no-fund
cd harness && npm install --ignore-scripts --no-audit --no-fund
node --experimental-strip-types --test config.test.ts
```

- [ ] **Step 7: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add pnpm-workspace.yaml package.json package-lock.json harness/package.json harness/config.ts harness/config.test.ts
git commit -m "feat(harness): scaffold harness package + SuiteConfig"
```

---

## Task 2: Unity batch-mode runner

**Files:** `harness/lib/unity-runner.ts` + test

`unity-runner.ts` finds Unity, spawns `Unity -batchmode ...`, parses NUnit3 XML.

- [ ] **Step 1: Write failing test**

`harness/lib/unity-runner.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { resolveUnityEditor, parseNUnit3Xml, unityCompile, type CompileResult } from './unity-runner.ts';

test('resolveUnityEditor honors UNITY_EDITOR_PATH env var', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'unity-'));
  const fake = path.join(tmp, 'Unity');
  fs.writeFileSync(fake, '');
  process.env.UNITY_EDITOR_PATH = fake;
  try {
    assert.equal(resolveUnityEditor(), fake);
  } finally {
    delete process.env.UNITY_EDITOR_PATH;
    fs.rmSync(tmp, { recursive: true });
  }
});

test('resolveUnityEditor autodetects under /Applications/Unity/Hub/Editor on macOS', { skip: process.platform !== 'darwin' }, () => {
  delete process.env.UNITY_EDITOR_PATH;
  const editor = resolveUnityEditor();
  // May be null if Unity not installed; that's fine for CI. If non-null, it must be the standard layout.
  if (editor) assert.match(editor, /\/Applications\/Unity\/Hub\/Editor\/6000\./);
});

test('parseNUnit3Xml extracts test results', () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<test-run id="1" testcasecount="2" result="Passed" total="2" passed="2" failed="0">
  <test-suite type="Assembly" name="MyTests">
    <test-suite type="TestSuite" name="MyClass">
      <test-case fullname="MyClass.A" result="Passed"></test-case>
      <test-case fullname="MyClass.B" result="Failed">
        <failure><message>nope</message></failure>
      </test-case>
    </test-suite>
  </test-suite>
</test-run>`;
  const results = parseNUnit3Xml(xml);
  assert.equal(results.length, 2);
  assert.equal(results[0].name, 'MyClass.A');
  assert.equal(results[0].outcome, 'Passed');
  assert.equal(results[1].outcome, 'Failed');
  assert.equal(results[1].message, 'nope');
});

test('unityCompile fails fast when no editor is resolvable', async () => {
  delete process.env.UNITY_EDITOR_PATH;
  // Use a path that definitely doesn't exist so autodetect also fails.
  const r: CompileResult = await unityCompile('/tmp/no-such-project-xyz', { editorPath: '/nope/Unity' });
  assert.equal(r.ok, false);
  assert.ok(r.errors[0].message.length > 0);
});
```

- [ ] **Step 2: Implement `unity-runner.ts`**

```typescript
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
    child.stdout.on('data', b => { stdout += b.toString(); if (opts.verbose) process.stdout.write(b); });
    child.stderr.on('data', b => { stderr += b.toString(); if (opts.verbose) process.stderr.write(b); });
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
```

- [ ] **Step 3: Verify**

```bash
cd /Users/lijinglue/repo/ggdd/harness
node --experimental-strip-types --test lib/unity-runner.test.ts
```
Expected: 4 tests pass. The autodetect test confirms it finds `/Applications/Unity/Hub/Editor/6000.3.11f1/...`.

- [ ] **Step 4: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add harness/lib/unity-runner.ts harness/lib/unity-runner.test.ts
git commit -m "feat(harness): Unity 6 batch-mode runner (resolve + compile + tests via NUnit3 XML)"
```

---

## Task 3: Agent runner abstraction + Claude Code implementation

**Files:** `harness/lib/agent-shared.ts`, `harness/agents/{claude-code,codex-cli,gemini-cli,jetski-cli}-agent.ts`

The `AgentRunner` interface is the same across agents. `claude-code-agent.ts` is the only real implementation in Plan 4 (we're running inside Claude Code so the CLI is available). Others are stubs that throw `NotImplementedError` with a clear message.

- [ ] **Step 1: Create `harness/lib/agent-shared.ts`**

```typescript
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
```

- [ ] **Step 2: Create `harness/agents/claude-code-agent.ts`**

```typescript
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
```

- [ ] **Step 3: Create the three stub runners**

`harness/agents/codex-cli-agent.ts`:

```typescript
import type { AgentRunner } from '../lib/agent-shared.ts';
import { NotImplementedError } from '../lib/agent-shared.ts';

export const CodexCliAgent: AgentRunner = {
  id: 'codex-cli',
  defaultModel: 'gpt-5-codex',
  async prepareSkill() { throw new NotImplementedError('codex-cli'); },
  async run() { throw new NotImplementedError('codex-cli'); },
};
```

`harness/agents/gemini-cli-agent.ts`:

```typescript
import type { AgentRunner } from '../lib/agent-shared.ts';
import { NotImplementedError } from '../lib/agent-shared.ts';

export const GeminiCliAgent: AgentRunner = {
  id: 'gemini-cli',
  defaultModel: 'gemini-2.0-flash',
  async prepareSkill() { throw new NotImplementedError('gemini-cli'); },
  async run() { throw new NotImplementedError('gemini-cli'); },
};
```

`harness/agents/jetski-cli-agent.ts`:

```typescript
import type { AgentRunner } from '../lib/agent-shared.ts';
import { NotImplementedError } from '../lib/agent-shared.ts';

export const JetskiCliAgent: AgentRunner = {
  id: 'jetski-cli',
  defaultModel: 'jetski-default',
  async prepareSkill() { throw new NotImplementedError('jetski-cli'); },
  async run() { throw new NotImplementedError('jetski-cli'); },
};
```

- [ ] **Step 4: Test that prepareSkill writes a CLAUDE.md file**

`harness/agents/claude-code-agent.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ClaudeCodeAgent } from './claude-code-agent.ts';
import { Serving } from '../config.ts';

test('prepareSkill drops a .claude/CLAUDE.md pointer in the workdir', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-'));
  try {
    await ClaudeCodeAgent.prepareSkill(dir, Serving.CLI);
    const p = path.join(dir, '.claude', 'CLAUDE.md');
    assert.ok(fs.existsSync(p));
    assert.match(fs.readFileSync(p, 'utf8'), /ggdd@latest search/);
  } finally {
    fs.rmSync(dir, { recursive: true });
  }
});
```

Run: `cd harness && node --experimental-strip-types --test agents/claude-code-agent.test.ts`

- [ ] **Step 5: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add harness/lib/agent-shared.ts harness/agents/
git commit -m "feat(harness): AgentRunner interface + claude-code impl + 3 stub agents"
```

---

## Task 4: Collection / metrics / reporting

**Files:** `harness/lib/collection.ts`, `harness/lib/metrics.ts`, `harness/lib/reporting.ts` + tests

- [ ] **Step 1: Create `harness/lib/collection.ts`**

```typescript
import * as path from 'node:path';
import { collectGuides, type CatalogEntry } from '../../lib/catalog.ts';

export interface SuiteTask {
  guideId: string;
  guideDir: string;
  category: CatalogEntry['category'];
  baseApp: string;
  gradeMode: CatalogEntry['frontmatter']['gradeMode'];
  taskMd: string;
}

export function collectSuiteTasks(filter?: { ids?: string[]; categories?: string[] }): SuiteTask[] {
  const guides = collectGuides();
  const fs = require('node:fs');
  return guides
    .filter(g => !filter?.ids || filter.ids.includes(g.id))
    .filter(g => !filter?.categories || filter.categories.includes(g.category))
    .map(g => ({
      guideId: g.id,
      guideDir: g.dir,
      category: g.category,
      baseApp: g.frontmatter.baseApp,
      gradeMode: g.frontmatter.gradeMode,
      taskMd: fs.readFileSync(path.join(g.dir, 'tasks', 'task.md'), 'utf8'),
    }));
}
```

- [ ] **Step 2: Create `harness/lib/metrics.ts`**

```typescript
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
```

- [ ] **Step 3: Create `harness/lib/reporting.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RunResult, SuiteSummary } from './metrics.ts';

export function writeRunResult(outputDir: string, runStamp: string, agent: string, guideId: string, result: RunResult): string {
  const dir = path.join(outputDir, runStamp);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${agent}-${guideId}.json`);
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  return out;
}

export function writeSuiteSummary(outputDir: string, runStamp: string, summary: SuiteSummary): string {
  const dir = path.join(outputDir, runStamp);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'summary.json');
  fs.writeFileSync(out, JSON.stringify(summary, null, 2));
  return out;
}

export function nowStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
}
```

- [ ] **Step 4: Add tests**

`harness/lib/metrics.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { summarize, type RunResult } from './metrics.ts';

function r(guideId: string, agent: string, pass: number, fail: number, category: string): RunResult {
  return {
    guideId, agent, modelVersion: 'm',
    grader: { pass, fail, total: pass + fail, rate: pass / (pass + fail), perAssertion: [] },
    agentDurationMs: 1000, totalDurationMs: 1100, exitCode: 0,
    // @ts-expect-error attaching category for the per-cat aggregation
    category,
  };
}

test('summarize aggregates pass rates correctly', () => {
  const s = summarize([
    r('a', 'cc', 6, 0, 'unity-engine'),
    r('b', 'cc', 3, 3, 'unity-performance'),
    r('c', 'cc', 0, 6, 'unity-performance'),
  ]);
  assert.equal(s.runs, 3);
  // aggregate rate = (1.0 + 0.5 + 0.0) / 3 = 0.5
  assert.equal(s.aggregatePassRate, 0.5);
  assert.equal(s.byAgent['cc'].runs, 3);
  // unity-performance avg = (0.5 + 0) / 2 = 0.25
  assert.equal(s.byCategory['unity-performance'].passRate, 0.25);
});

test('summarize handles empty runs', () => {
  const s = summarize([]);
  assert.equal(s.runs, 0);
  assert.equal(s.aggregatePassRate, 0);
});
```

`harness/lib/collection.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { collectSuiteTasks } from './collection.ts';

test('collectSuiteTasks returns all 12 with no filter', () => {
  const t = collectSuiteTasks();
  assert.equal(t.length, 12);
  assert.ok(t.every(x => x.taskMd.length > 0));
});

test('collectSuiteTasks filters by id', () => {
  const t = collectSuiteTasks({ ids: ['new-input-system-basics'] });
  assert.equal(t.length, 1);
  assert.equal(t[0].guideId, 'new-input-system-basics');
});

test('collectSuiteTasks filters by category', () => {
  const t = collectSuiteTasks({ categories: ['game-design-action'] });
  assert.equal(t.length, 3);
});
```

- [ ] **Step 5: Verify**

```bash
cd /Users/lijinglue/repo/ggdd/harness
node --experimental-strip-types --test lib/metrics.test.ts lib/collection.test.ts
```

- [ ] **Step 6: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add harness/lib/collection.ts harness/lib/collection.test.ts harness/lib/metrics.ts harness/lib/metrics.test.ts harness/lib/reporting.ts
git commit -m "feat(harness): collection + metrics + reporting helpers"
```

---

## Task 5: Create `empty-unity6` base-app via Unity batch mode

**Files:** `harness/base_apps/empty-unity6/` (Unity 6 project, LFS-tracked)

We use Unity in batch mode to create a fresh project, then prune Library/Temp/etc., commit what remains under LFS.

- [ ] **Step 1: Create the Unity project**

```bash
mkdir -p /Users/lijinglue/repo/ggdd/harness/base_apps
UNITY="/Applications/Unity/Hub/Editor/6000.3.11f1/Unity.app/Contents/MacOS/Unity"
"$UNITY" -batchmode -nographics -createProject /Users/lijinglue/repo/ggdd/harness/base_apps/empty-unity6 -quit -logFile -
```

Expected: command exits 0; directory `harness/base_apps/empty-unity6/` now contains `Assets/`, `Packages/`, `ProjectSettings/`, `Library/`, etc.

- [ ] **Step 2: Add URP + Input System + Test Framework via manifest edit**

Edit `harness/base_apps/empty-unity6/Packages/manifest.json` to ensure these dependencies are present:

```json
{
  "dependencies": {
    "com.unity.render-pipelines.universal": "17.0.4",
    "com.unity.inputsystem": "1.11.2",
    "com.unity.test-framework": "1.4.5",
    "com.unity.ide.visualstudio": "2.0.22",
    "com.unity.ugui": "2.0.0"
  }
}
```

(Leave existing entries Unity put there. Just merge these in if missing.)

- [ ] **Step 3: Open Unity once headless to resolve packages**

```bash
"$UNITY" -batchmode -nographics -projectPath /Users/lijinglue/repo/ggdd/harness/base_apps/empty-unity6 -quit -logFile -
```

This resolves and downloads packages (writes `Packages/packages-lock.json`).

- [ ] **Step 4: Add base-app `.gitignore` and `README.md`**

`harness/base_apps/empty-unity6/.gitignore`:

```
# Unity ignores (these are local-only; the workspace-level .gitignore also covers them)
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Ll]ogs/
[Uu]serSettings/
[Mm]emoryCaptures/
*.csproj
*.sln
*.suo
*.user
*.unityproj
```

`harness/base_apps/empty-unity6/README.md`:

```markdown
# empty-unity6

Minimal Unity 6 (6000.3.11f1) project with URP, Input System, and Test Framework.
Used by graders with `baseApp: empty-unity6`.

## Pre-warming the Library cache

```shell
ggdd-dev warm-cache empty-unity6
```

Populates `library-cache/` so subsequent grader runs start with `Library/` symlinked to the warm copy (~5s subsequent runs vs. ~90s cold).
```

- [ ] **Step 5: Confirm what gets staged is small + LFS-tracked for binaries**

```bash
cd /Users/lijinglue/repo/ggdd
git add harness/base_apps/empty-unity6
git status --short | head -30
# Should NOT include Library/ or Temp/. Should include Assets/, Packages/, ProjectSettings/, README.md.
git ls-files --stage harness/base_apps/empty-unity6 | head -20
```

If any image/audio/binary files appear (they usually don't in a fresh empty project), confirm they're LFS pointers per `.gitattributes`.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(harness): add empty-unity6 base-app (Unity 6000.3.11f1 + URP + Input System)"
```

If the commit is unexpectedly large (>5 MB), investigate which file pushed it; rollback and resolve LFS attributes before re-committing.

---

## Task 6: Placeholder base-apps + `negative/`

**Files:** `harness/base_apps/{brawler-skeleton,deckbuilder-skeleton,negative}/`

- [ ] **Step 1: Create placeholder READMEs for the two skeletons**

`harness/base_apps/brawler-skeleton/README.md`:

```markdown
# brawler-skeleton (placeholder)

This base-app is a placeholder. The action-design guides (hit-stop-on-impact, input-buffering, knockback-with-control-takeback) currently use `empty-unity6` until this skeleton is built out.

To create it:

```shell
UNITY="/Applications/Unity/Hub/Editor/6000.3.11f1/Unity.app/Contents/MacOS/Unity"
"$UNITY" -batchmode -nographics -createProject harness/base_apps/brawler-skeleton -quit
# Then add a basic 2D scene with a player, enemy, and combat scaffolding.
```

Tracked TODO: see CONTEXT.md.
```

`harness/base_apps/deckbuilder-skeleton/README.md`:

```markdown
# deckbuilder-skeleton (placeholder)

Placeholder. The deckbuilder-design guides currently use `empty-unity6`.

To create it: see brawler-skeleton/README.md for the analogous setup, then add a `Card` ScriptableObject + deck container + draw UI scene.

Tracked TODO: see CONTEXT.md.
```

- [ ] **Step 2: Create the `negative/` tiny C# project**

`harness/base_apps/negative/README.md`:

```markdown
# negative

Tiny non-Unity directory used to verify graders fail when the codebase is "wrong by construction."
Useful for grader self-tests during development (the cross-app verification mentioned in spec §5).
```

`harness/base_apps/negative/EnemyAI.cs`:

```csharp
// Intentionally empty / wrong-by-construction.
public class EnemyAI {}
```

- [ ] **Step 3: Update guides to point action/deckbuilder ones at empty-unity6 (temporarily)**

The 6 action + deckbuilder guides already declare `baseApp: empty-unity6` per the Plan 2 frontmatter fix. Confirm with:

```bash
grep -rE "^baseApp:" guides/game-design-action guides/game-design-deckbuilder
```

Expected: every line shows `baseApp: empty-unity6`. No change needed.

- [ ] **Step 4: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add harness/base_apps/brawler-skeleton harness/base_apps/deckbuilder-skeleton harness/base_apps/negative
git commit -m "feat(harness): add brawler-skeleton + deckbuilder-skeleton placeholders + negative base-app"
```

---

## Task 7: run_suite.ts + evaluate.ts + quick-smoke.ts

**Files:** `harness/run_suite.ts`, `harness/evaluate.ts`, `harness/quick-smoke.ts`, `harness/backfill.ts`, `harness/upload_suite.ts`

`run_suite` orchestrates the full eval loop. `evaluate` is the public entry. `quick-smoke` runs a single (agent, guide) pair end-to-end.

- [ ] **Step 1: Create `harness/run_suite.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
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
  const baseSrc = path.join(path.dirname(new URL(import.meta.url).pathname), 'base_apps', task.baseApp);
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
```

- [ ] **Step 2: Create `harness/evaluate.ts`**

```typescript
import { resolveSuiteConfig } from './config.ts';
import { runSuite } from './run_suite.ts';

export async function evaluate(opts: { configPath?: string; tasks?: string[] } = {}): Promise<void> {
  const suiteConfig = await resolveSuiteConfig({ configPath: opts.configPath });
  await runSuite({ suiteConfig, tasks: opts.tasks });
}
```

- [ ] **Step 3: Create `harness/quick-smoke.ts`**

```typescript
import { evaluate } from './evaluate.ts';

const guide = process.argv[2] ?? 'new-input-system-basics';
console.log(`Quick smoke: ${guide}`);
evaluate({ tasks: [guide] }).catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 4: Create placeholder `backfill.ts` + `upload_suite.ts`**

`harness/backfill.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { summarize, type RunResult } from './lib/metrics.ts';
import { writeSuiteSummary } from './lib/reporting.ts';
import { resolveSuiteConfig } from './config.ts';

export async function backfill(): Promise<void> {
  const cfg = await resolveSuiteConfig();
  if (!fs.existsSync(cfg.outputDir)) { console.error(`No runs dir: ${cfg.outputDir}`); return; }
  for (const stamp of fs.readdirSync(cfg.outputDir)) {
    const stampDir = path.join(cfg.outputDir, stamp);
    if (!fs.statSync(stampDir).isDirectory()) continue;
    const runs: RunResult[] = [];
    for (const f of fs.readdirSync(stampDir)) {
      if (!f.endsWith('.json') || f === 'summary.json') continue;
      runs.push(JSON.parse(fs.readFileSync(path.join(stampDir, f), 'utf8')));
    }
    if (runs.length === 0) continue;
    writeSuiteSummary(cfg.outputDir, stamp, summarize(runs));
    console.log(`  ${stamp}: re-summarized ${runs.length} runs`);
  }
}
```

`harness/upload_suite.ts`:

```typescript
import { resolveSuiteConfig } from './config.ts';

export async function uploadSuite(): Promise<void> {
  const cfg = await resolveSuiteConfig();
  if (!process.env.GGDD_GCS_BUCKET) {
    console.log('GGDD_GCS_BUCKET not set; skipping upload (Plan 5+ wires real GCS upload).');
    return;
  }
  console.log(`[TODO Plan 5] Upload ${cfg.outputDir} to gs://${process.env.GGDD_GCS_BUCKET}/`);
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add harness/run_suite.ts harness/evaluate.ts harness/quick-smoke.ts harness/backfill.ts harness/upload_suite.ts
git commit -m "feat(harness): run_suite orchestration + evaluate + quick-smoke + backfill stub"
```

---

## Task 8: Wire `ggdd-dev eval` / `run` / `warm-cache` / `backfill` / `upload` / `dashboard` / `deploy`

**Files:** `bin/ggdd-dev.ts` (modify)

- [ ] **Step 1: Extend the dispatch table and switch**

In `bin/ggdd-dev.ts`, add the new commands to `COMMANDS` and to the switch in `main()`. Replace the `warm-cache` placeholder with a real impl, and add new `eval`, `run`, `backfill`, `upload`, `dashboard`, `deploy`:

Add to `COMMANDS`:

```typescript
  eval: 'Run the evaluation suite (or specific guide ids via --tasks)',
  run: 'Run an ad-hoc agent test against a base-app (--template <baseApp> --prompt "...")',
  backfill: 'Recompute metrics for historical run artifacts',
  upload: 'Upload results to GCS (requires GGDD_GCS_BUCKET)',
  dashboard: '[Plan 5] Start the eval-view dashboard locally',
  deploy: '[Plan 5] Publish eval-view to GitHub Pages',
```

Replace the `warm-cache` branch and add new branches. The relevant additions inside `switch (cmd)`:

```typescript
    case 'eval': {
      const tasksFlag = (values as any).tasks as string | undefined;
      const tasks = tasksFlag ? tasksFlag.split(',').map(s => s.trim()).filter(Boolean)
                              : positionals.slice(1).filter(p => p !== 'suite');
      const { evaluate } = await import('../harness/evaluate.ts');
      await evaluate({ configPath: (values as any).config, tasks });
      break;
    }
    case 'run': {
      const tmpl = positionals[1];
      const prompt = positionals.slice(2).join(' ');
      if (!tmpl || !prompt) { console.error(cRed('ggdd-dev run <baseApp> "<prompt>"')); process.exit(1); }
      const { runSuite } = await import('../harness/run_suite.ts');
      const { resolveSuiteConfig } = await import('../harness/config.ts');
      const suiteConfig = await resolveSuiteConfig({ configPath: (values as any).config });
      // Synthesize a one-off task: pick the first guide for that base-app.
      const { collectSuiteTasks } = await import('../harness/lib/collection.ts');
      const all = collectSuiteTasks();
      const t = all.find(x => x.baseApp === tmpl);
      if (!t) { console.error(cRed(`No guide uses baseApp=${tmpl}`)); process.exit(1); }
      const synthetic = { ...t, taskMd: prompt };
      // ad-hoc: replace tasks at suite level
      (global as any).__GGDD_ADHOC_TASK = synthetic;
      await runSuite({ suiteConfig, tasks: [t.guideId] });
      break;
    }
    case 'warm-cache': {
      const baseApp = opts.guide ?? positionals[1];
      if (!baseApp) { console.error(cRed('ggdd-dev warm-cache <baseApp>')); process.exit(1); }
      const { unityCompile, resolveUnityEditor } = await import('../harness/lib/unity-runner.ts');
      const editor = resolveUnityEditor();
      if (!editor) {
        console.error(cRed('Unity 6 Editor not found. Set UNITY_EDITOR_PATH or install via Unity Hub.'));
        process.exit(1);
      }
      const baseSrc = path.join(ROOT, 'harness', 'base_apps', baseApp);
      const fs = await import('node:fs');
      if (!fs.existsSync(baseSrc)) { console.error(cRed(`Base app missing: ${baseSrc}`)); process.exit(1); }
      console.log(cBold(`warm-cache ${baseApp} (first-time imports may take 60-90s)…`));
      const r = await unityCompile(baseSrc, { verbose: !!values.verbose, timeoutMs: 600_000 });
      console.log(r.ok ? `${cGreen('✓')} warmed` : `${cRed('✗')} compile errors:\n${r.errors.map(e => `  ${e.message}`).join('\n')}`);
      process.exit(r.ok ? 0 : 1);
    }
    case 'backfill': {
      const { backfill } = await import('../harness/backfill.ts');
      await backfill();
      break;
    }
    case 'upload': {
      const { uploadSuite } = await import('../harness/upload_suite.ts');
      await uploadSuite();
      break;
    }
    case 'dashboard':
    case 'deploy':
      console.log(cDim(`[${cmd}] is a Plan 5 placeholder.`));
      process.exit(0);
```

Add `cGreen` to imports in `bin/ggdd-dev.ts` if not already imported.

- [ ] **Step 2: Smoke the wiring (no real eval — just confirm dispatch works)**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types bin/ggdd-dev.ts --help | grep -c '^  '   # should be 16+
node --experimental-strip-types bin/ggdd-dev.ts backfill                   # exits 0 (no runs dir yet)
node --experimental-strip-types bin/ggdd-dev.ts upload                     # prints GGDD_GCS_BUCKET skip
node --experimental-strip-types bin/ggdd-dev.ts dashboard                  # prints Plan 5 placeholder
```

- [ ] **Step 3: Commit**

```bash
git add bin/ggdd-dev.ts
git commit -m "feat(bin): wire eval/run/warm-cache/backfill/upload/dashboard/deploy commands"
```

---

## Task 9: Switch one perf grader to `gradeMode: static+unity` (smoke the Unity path)

**Files:** `guides/unity-performance/gc-free-update-loop/guide.md`

- [ ] **Step 1: Update the guide's frontmatter**

Change `gradeMode: static` → `gradeMode: static+unity` for `gc-free-update-loop`.

The grader itself doesn't need to change — Plan 4 only swaps the metadata so Plan 5+ dashboards can render it differently. The static checks still run via `node --test`; Unity batch checks are wired into `test-fixture.ts` as a future extension.

- [ ] **Step 2: Regenerate corpus + verify all graders still pass**

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types scripts/build-guides.ts
cd ..
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
```

Expected: `All 12 graders calibrated.`

- [ ] **Step 3: Commit**

```bash
git add guides/unity-performance/gc-free-update-loop/guide.md serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin
git commit -m "feat(guides): mark gc-free-update-loop as gradeMode: static+unity"
```

---

## Task 10: CONTEXT.md + preflight + tag

- [ ] **Step 1: Update `CONTEXT.md`**

Replace the `harness/` entry (currently says "Plan 4") with:

```
- `harness/` — eval infrastructure (Plan 4): Unity batch-mode runner, agent runners (claude-code primary; codex/gemini/jetski stubs), suite orchestration, metrics, reporting. Plan 4 ships `empty-unity6` base-app via LFS; the brawler/deckbuilder skeletons are placeholders that fall back to `empty-unity6`.
```

Append to Active TODOs:

```
- **Stub agent runners.** `codex-cli`, `gemini-cli`, `jetski-cli` throw `NotImplementedError`. Wire them up when needed by adding the relevant CLI invocation logic per `claude-code-agent.ts`.
- **Skeleton base-apps.** `brawler-skeleton` and `deckbuilder-skeleton` are README placeholders. Build them out as real Unity 6 projects (scene + scripts + URP) before the action/deckbuilder guides need genuine project context.
- **Unity batch helpers in test-fixture.** `unityCompile`/`unityRunEditModeTests` exist in `harness/lib/unity-runner.ts` but no grader calls them yet. Wire them into `guides/test-fixture.ts` when a guide upgrades to `gradeMode: static+unity`.
- **Real GCS upload.** `harness/upload_suite.ts` is a no-op stub. Wire it up in Plan 5 when the dashboard needs remote artifacts.
```

- [ ] **Step 2: Full preflight**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts' 2>&1 | tail -3
cd serving && node --experimental-strip-types --test --test-timeout 60000 'lib/**/*.test.ts' 'bin/**/*.test.ts' 'mcp-server/**/*.test.ts' 'scripts/**/*.test.ts' 'skills-cli/**/*.test.ts' 2>&1 | tail -3
cd ../harness && node --experimental-strip-types --test --test-timeout 60000 'config.test.ts' 'lib/*.test.ts' 'agents/*.test.ts' 2>&1 | tail -3
cd .. && node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
cd serving && node --experimental-strip-types skills-cli/build-dist.ts
cd ..
```

Expected: all tests pass; dev-all reports 12 calibrated.

- [ ] **Step 3: Commit + tag**

```bash
git add CONTEXT.md
git commit -m "docs: update CONTEXT.md with Plan 4 harness scope notes"
git tag v0.4.0-plan4
git log --oneline | head -15
```

---

## Plan 4 acceptance checks

- [ ] `harness/` is a recognized workspace package (`pnpm-workspace.yaml`)
- [ ] `harness/config.test.ts`, `harness/lib/*.test.ts`, `harness/agents/*.test.ts` all green
- [ ] `harness/lib/unity-runner.ts`'s `resolveUnityEditor()` finds the local Unity 6 install
- [ ] `harness/base_apps/empty-unity6/Packages/manifest.json` exists with URP + Input System + Test Framework
- [ ] `ggdd-dev --help` lists `eval`, `run`, `warm-cache`, `backfill`, `upload`, `dashboard`, `deploy`
- [ ] `ggdd-dev dev-all --test-grader` still passes (no regression from Plan 3)
- [ ] Tag `v0.4.0-plan4`

---

## Out of scope for Plan 4

- **Real Unity-batch grader integration**: a guide upgrading to `gradeMode: static+unity` whose grader actually calls `unityCompile`/`unityRunEditModeTests`. Plan 5+ when the first guide genuinely needs Unity-level checks.
- **`brawler-skeleton` / `deckbuilder-skeleton`**: tracked TODO.
- **Other agent runners**: codex/gemini/jetski are stubbed.
- **Dashboard / deploy**: Plan 5.
- **GCS upload**: Plan 5/6.

## Self-review

- **Spec coverage:** Plan 4 implements design §5 (Unity batch invocation), §6 (harness with base apps, agent runners, suite orchestration, metrics, dashboard hooks). Dashboard SPA is Plan 5; Unity batch grader integration is intentionally deferred.
- **No placeholders:** every file/step contains real code or commands.
- **Type consistency:** `AgentRunner`, `AgentRunResult`, `AgentRunOpts`, `RunResult`, `SuiteSummary`, `SuiteTask`, `SuiteConfig`, `Serving` enum — names consistent across `harness/`. The agent runners share the same interface.
