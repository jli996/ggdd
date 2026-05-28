# ggdd Plan 3 — Authoring CLI (`ggdd-dev`)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (or superpowers:executing-plans). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship the root-package `ggdd-dev` CLI that automates per-guide authoring (`audit`, `dev`, `dev-all`, `gen-grader`, `gen-negative`, `test-grader`, `grade`), enforces grader calibration in CI, and stubs out the Unity-batch-mode commands that land in Plan 4.

**Architecture:** `bin/ggdd-dev.ts` is the dispatch entry; subcommand logic lives in `guides/*.ts` modules (`dev-guide.ts`, `grader-gen.ts`, `negative-gen.ts`, `test-grader.ts`, `run-grader.ts`). LLM-driven generators use `@anthropic-ai/sdk` with prompt caching and read `ANTHROPIC_API_KEY` from `.env` (via Node 20+ `process.loadEnvFile`). The `audit` table and `test-grader` walker reuse the catalog produced by Plan 1's frontmatter validator. CI gains a `ggdd-dev dev-all --test-grader` step that enforces "every grader passes against demo AND fails against negative-demo" — the calibration contract.

**Tech Stack:** Node 22+ (`--experimental-strip-types`), `node:test`, `omelette` (shell completion, MWG's choice), `@anthropic-ai/sdk@^0.43`, Plan 1's `lib/colors.ts` + `lib/guide-validation.ts`, npm (not pnpm — see CONTEXT.md).

**Branch:** `feature/plan-3-authoring-cli` (off `main`, after PR #2 merged at `23224cb`).

---

## File map

```
/Users/lijinglue/repo/ggdd/
├── package.json                              # MODIFY (add bin: ggdd-dev, deps)
├── .env.example                              # exists; ANTHROPIC_API_KEY already declared
├── bin/
│   └── ggdd-dev.ts                           # NEW — root CLI entry (mirrors MWG bin/gd.ts)
├── lib/
│   └── catalog.ts                            # NEW — guide-walker helper (reused across commands)
├── guides/
│   ├── run-grader.ts                         # NEW — run a single grader, return {pass, fail}
│   ├── run-grader.test.ts                    # NEW
│   ├── test-grader.ts                        # NEW — demo must pass + negative-demo must fail
│   ├── test-grader.test.ts                   # NEW
│   ├── grader-gen.ts                         # NEW — Anthropic-driven grader scaffolding
│   ├── negative-gen.ts                       # NEW — Anthropic-driven negative-demo scaffolding
│   ├── anthropic-client.ts                   # NEW — shared SDK wrapper w/ prompt caching
│   ├── dev-guide.ts                          # NEW — audit/dev/dev-all orchestration
│   └── dev-guide.test.ts                     # NEW
├── .github/workflows/preflight.yml           # MODIFY — add `ggdd-dev dev-all --test-grader`
└── CONTEXT.md                                # MODIFY — note Plan 3 scope + tracked TODOs
```

---

## Task 1: Root bin + workspace plumbing

**Files:**
- Modify: `package.json` (add `bin: ggdd-dev`, omelette + Anthropic SDK deps, `dev` script)
- Create: `bin/ggdd-dev.ts` (skeleton with --help/--version, dispatch table)
- Create: `lib/catalog.ts` (walks `guides/` and returns parsed `GuideFrontmatter[]` + paths)
- Create: `lib/catalog.test.ts`

- [ ] **Step 1: Install deps**

```bash
cd /Users/lijinglue/repo/ggdd
npm install --ignore-scripts --no-audit --no-fund --save-dev \
  omelette@^0.4.17 \
  @anthropic-ai/sdk@^0.43.0
```

- [ ] **Step 2: Modify `package.json`**

Add `"bin"` entry, new script `dev` (alias), and the runtime dep `omelette`. Final relevant fields:

```json
{
  "name": "ggdd-workspace",
  "bin": {
    "ggdd-dev": "bin/ggdd-dev.ts"
  },
  "scripts": {
    "test": "pnpm -r --parallel test",
    "build": "pnpm -r run build",
    "typecheck": "tsc --noEmit && pnpm -r --parallel typecheck",
    "lint": "oxlint --ignore-path .oxlintignore",
    "preflight": "pnpm build && pnpm typecheck && pnpm lint && pnpm test",
    "build:mcp": "pnpm --filter serving build",
    "build:megaskill": "pnpm --filter serving build:megaskill",
    "dev": "node --experimental-strip-types bin/ggdd-dev.ts"
  },
  "devDependencies": {
    "@anthropic-ai/sdk": "^0.43.0",
    "@types/node": "^25.6.0",
    "@types/omelette": "^0.4.5",
    "gray-matter": "^4.0.3",
    "omelette": "^0.4.17",
    "oxlint": "^1.55.0",
    "tree-sitter": "^0.21.1",
    "tree-sitter-c-sharp": "^0.21.3",
    "typescript": "^5.9.3",
    "zod": "^4.4.3"
  }
}
```

(Keep `pnpm` config unchanged. Run `npm install --ignore-scripts` afterward.)

- [ ] **Step 3: Write failing test for `catalog.ts`**

`lib/catalog.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { collectGuides } from './catalog.ts';

test('collectGuides returns parsed entries for every guide.md under guides/', () => {
  const entries = collectGuides();
  assert.ok(entries.length >= 12, `expected at least 12 guides, got ${entries.length}`);
  for (const e of entries) {
    assert.ok(e.id);
    assert.ok(e.category);
    assert.ok(e.guidePath.endsWith('guide.md'));
    assert.ok(e.dir);
  }
});

test('every collected guide has the expected on-disk siblings (demo, negative-demo, grader)', () => {
  const entries = collectGuides();
  const fs = require('node:fs');
  const path = require('node:path');
  for (const e of entries) {
    assert.ok(fs.existsSync(path.join(e.dir, 'expectations.md')), `${e.id}: missing expectations.md`);
    assert.ok(fs.existsSync(path.join(e.dir, 'grader.ts')), `${e.id}: missing grader.ts`);
    assert.ok(fs.existsSync(path.join(e.dir, 'demo')), `${e.id}: missing demo/`);
    assert.ok(fs.existsSync(path.join(e.dir, 'negative-demo')), `${e.id}: missing negative-demo/`);
  }
});
```

- [ ] **Step 4: Implement `lib/catalog.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseGuide, validateFrontmatter, type GuideFrontmatter } from './guide-validation.ts';
import { guidesDir } from './paths.ts';

export interface CatalogEntry {
  id: string;
  category: GuideFrontmatter['category'];
  guidePath: string;
  dir: string;
  frontmatter: GuideFrontmatter;
}

export function collectGuides(rootDir: string = guidesDir): CatalogEntry[] {
  const out: CatalogEntry[] = [];
  function walk(d: string) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name === 'guide.md') {
        const fm = validateFrontmatter(parseGuide(fs.readFileSync(full, 'utf8')).frontmatter);
        out.push({ id: fm.id, category: fm.category, guidePath: full, dir: path.dirname(full), frontmatter: fm });
      }
    }
  }
  walk(rootDir);
  return out.sort((a, b) => a.id.localeCompare(b.id));
}
```

Verify: `node --experimental-strip-types --test lib/catalog.test.ts` → 2 tests pass.

- [ ] **Step 5: Create `bin/ggdd-dev.ts` skeleton with dispatch**

```typescript
#!/usr/bin/env -S node --experimental-strip-types

import { parseArgs } from 'node:util';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cBold, cCyan, cDim, cRed } from '../lib/colors.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env (Node 20+).
try { (process as any).loadEnvFile?.(path.join(ROOT, '.env')); } catch { /* ok if missing */ }

const COMMANDS = {
  audit: 'Show status of all guides',
  dev: 'Run author loop for a single guide (or all with dev-all)',
  'dev-all': 'Run dev pipeline across every guide',
  'gen-grader': 'Generate grader.ts via Anthropic (requires ANTHROPIC_API_KEY)',
  'gen-negative': 'Generate negative-demo via Anthropic (requires ANTHROPIC_API_KEY)',
  'test-grader': 'Validate calibration: grader must pass demo, fail negative-demo',
  grade: 'Run a guide grader against its demo (or TARGET_FILE)',
  'warm-cache': '[Plan 4] Pre-populate Unity Library cache for a base-app',
  apiref: '[Placeholder] Unity API/version compat lookup',
  'setup-completion': 'Install shell auto-completion',
} as const;

type CommandName = keyof typeof COMMANDS;

function printUsage() {
  console.log(`\n${cCyan('Usage:')} ggdd-dev <command> [options]\n`);
  console.log(cBold('Commands:'));
  for (const [name, desc] of Object.entries(COMMANDS)) {
    console.log(`  ${cCyan(name.padEnd(20))} ${desc}`);
  }
  console.log(`\n${cBold('Common flags:')}`);
  console.log(`  ${cDim('--guide <dir>')}        Path to a guide directory (e.g. guides/unity-engine/new-input-system-basics)`);
  console.log(`  ${cDim('--verbose')}             Show additional output`);
  console.log(`  ${cDim('-h, --help')}           Show this help`);
  console.log(`  ${cDim('-v, --version')}        Show version\n`);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      verbose: { type: 'boolean' },
      guide: { type: 'string' },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.version) {
    const fs = await import('node:fs');
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    console.log(pkg.version || '0.0.0');
    process.exit(0);
  }

  const cmd = positionals[0] as CommandName | undefined;
  if (!cmd || values.help) { printUsage(); process.exit(values.help ? 0 : 1); }

  const opts = { verbose: !!values.verbose, guide: (values.guide as string | undefined) ?? positionals[1] };

  switch (cmd) {
    case 'audit': {
      const { auditGuides } = await import('../guides/dev-guide.ts');
      const ok = await auditGuides({ verbose: opts.verbose });
      process.exit(ok ? 0 : 1);
    }
    case 'dev': {
      if (!opts.guide) { console.error(cRed('ggdd-dev dev requires --guide <dir>')); process.exit(1); }
      const { devGuide } = await import('../guides/dev-guide.ts');
      const ok = await devGuide(opts.guide, { verbose: opts.verbose });
      process.exit(ok ? 0 : 1);
    }
    case 'dev-all': {
      const { devAll } = await import('../guides/dev-guide.ts');
      const ok = await devAll({ verbose: opts.verbose, testGraderOnly: process.argv.includes('--test-grader') });
      process.exit(ok ? 0 : 1);
    }
    case 'test-grader': {
      if (!opts.guide) { console.error(cRed('ggdd-dev test-grader requires --guide <dir>')); process.exit(1); }
      const { testGrader } = await import('../guides/test-grader.ts');
      const ok = await testGrader(opts.guide, { verbose: opts.verbose });
      process.exit(ok ? 0 : 1);
    }
    case 'grade': {
      if (!opts.guide) { console.error(cRed('ggdd-dev grade requires --guide <dir>')); process.exit(1); }
      const { runGrader } = await import('../guides/run-grader.ts');
      const res = await runGrader(opts.guide, { target: process.env.TARGET_FILE });
      console.log(`${res.pass} pass, ${res.fail} fail`);
      process.exit(res.fail === 0 ? 0 : 1);
    }
    case 'gen-grader': {
      if (!opts.guide) { console.error(cRed('ggdd-dev gen-grader requires --guide <dir>')); process.exit(1); }
      const { generateGrader } = await import('../guides/grader-gen.ts');
      await generateGrader(opts.guide);
      break;
    }
    case 'gen-negative': {
      if (!opts.guide) { console.error(cRed('ggdd-dev gen-negative requires --guide <dir>')); process.exit(1); }
      const { generateNegative } = await import('../guides/negative-gen.ts');
      await generateNegative(opts.guide);
      break;
    }
    case 'warm-cache':
    case 'apiref':
      console.log(cDim(`[${cmd}] is a placeholder for Plan 4+. Unity 6 only / no-op in Plan 3.`));
      process.exit(0);
    case 'setup-completion': {
      const omelette = (await import('omelette')).default;
      const c = omelette('ggdd-dev <command>');
      c.setupShellInitFile();
      console.log('Shell completion installed; restart your terminal.');
      process.exit(0);
    }
    default:
      console.error(cRed(`Unknown command: ${cmd}`));
      printUsage();
      process.exit(1);
  }
}

main().catch(err => { console.error(cRed('Execution failed:'), err); process.exit(1); });
```

- [ ] **Step 6: Verify CLI boots**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types bin/ggdd-dev.ts --version
node --experimental-strip-types bin/ggdd-dev.ts --help
node --experimental-strip-types bin/ggdd-dev.ts warm-cache    # prints placeholder
node --experimental-strip-types bin/ggdd-dev.ts apiref        # prints placeholder
```

Expected: version prints; help lists 10 commands; placeholders exit 0.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json bin/ggdd-dev.ts lib/catalog.ts lib/catalog.test.ts
git commit -m "feat(bin): scaffold ggdd-dev CLI with dispatch + catalog walker"
```

---

## Task 2: `run-grader` + `grade` command

**Files:**
- Create: `guides/run-grader.ts`
- Create: `guides/run-grader.test.ts`

`run-grader` invokes `node --test grader.ts` as a subprocess and parses pass/fail counts from output. Used by `grade`, `test-grader`, and `dev-all`.

- [ ] **Step 1: Write failing test**

`guides/run-grader.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { runGrader } from './run-grader.ts';
import { rootDir } from '../lib/paths.ts';

const NEW_INPUT = path.join(rootDir, 'guides', 'unity-engine', 'new-input-system-basics');

test('runGrader returns pass count for a known-good demo', async () => {
  const res = await runGrader(NEW_INPUT);
  assert.ok(res.pass >= 1, `expected pass >= 1, got ${res.pass}`);
  assert.equal(res.fail, 0);
});

test('runGrader fails when pointed at the negative-demo via TARGET_FILE', async () => {
  const neg = path.join(NEW_INPUT, 'negative-demo', 'PlayerController.cs');
  const res = await runGrader(NEW_INPUT, { target: neg });
  assert.ok(res.fail >= 1, `expected fail >= 1, got ${res.fail}`);
});

test('runGrader throws if the guide dir has no grader.ts', async () => {
  await assert.rejects(() => runGrader('/tmp/does-not-exist-xyz'));
});
```

- [ ] **Step 2: Implement `run-grader.ts`**

```typescript
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

  const env = { ...process.env };
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
      // node:test summary lines like `# pass 5` and `# fail 1`.
      const pass = parseInt(stdout.match(/^# pass (\d+)/m)?.[1] ?? '0', 10);
      const fail = parseInt(stdout.match(/^# fail (\d+)/m)?.[1] ?? '0', 10);
      resolve({ pass, fail, stdout, stderr });
    });
    child.on('error', reject);
  });
}
```

- [ ] **Step 3: Verify**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/run-grader.test.ts --test-timeout 60000
```
Expected: 3 tests pass.

- [ ] **Step 4: Smoke the `grade` command end-to-end**

```bash
node --experimental-strip-types bin/ggdd-dev.ts grade --guide guides/unity-engine/new-input-system-basics
```
Expected: prints `6 pass, 0 fail`, exits 0.

```bash
TARGET_FILE=guides/unity-engine/new-input-system-basics/negative-demo/PlayerController.cs \
  node --experimental-strip-types bin/ggdd-dev.ts grade --guide guides/unity-engine/new-input-system-basics
```
Expected: prints `2 pass, 4 fail`, exits 1.

- [ ] **Step 5: Commit**

```bash
git add guides/run-grader.ts guides/run-grader.test.ts
git commit -m "feat(guides): run-grader.ts + ggdd-dev grade command"
```

---

## Task 3: `test-grader` + calibration enforcement

**Files:**
- Create: `guides/test-grader.ts`
- Create: `guides/test-grader.test.ts`

`test-grader` enforces the calibration contract: a guide's grader must (a) pass against `demo/*.cs` and (b) fail at least one assertion against `negative-demo/*.cs`. Used by CI to gate merges that touch `guides/`.

- [ ] **Step 1: Write failing test**

`guides/test-grader.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { testGrader } from './test-grader.ts';
import { rootDir } from '../lib/paths.ts';

test('testGrader passes for a properly calibrated guide', async () => {
  const ok = await testGrader(path.join(rootDir, 'guides', 'unity-engine', 'new-input-system-basics'));
  assert.equal(ok, true);
});
```

- [ ] **Step 2: Implement `test-grader.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { runGrader } from './run-grader.ts';
import { cGreen, cRed, cDim } from '../lib/colors.ts';

export interface TestGraderOptions {
  verbose?: boolean;
}

/** Returns true iff demo passes (fail===0) AND negative-demo fails at least one assertion. */
export async function testGrader(guideDir: string, opts: TestGraderOptions = {}): Promise<boolean> {
  const demoDir = path.join(guideDir, 'demo');
  const negDir = path.join(guideDir, 'negative-demo');
  if (!fs.existsSync(demoDir)) { console.error(cRed(`${guideDir}: missing demo/`)); return false; }
  if (!fs.existsSync(negDir)) { console.error(cRed(`${guideDir}: missing negative-demo/`)); return false; }

  // Pick the first .cs file in demo and negative-demo as the target.
  const demoTarget = firstCs(demoDir);
  const negTarget = firstCs(negDir);
  if (!demoTarget) { console.error(cRed(`${guideDir}: no .cs file under demo/`)); return false; }
  if (!negTarget) { console.error(cRed(`${guideDir}: no .cs file under negative-demo/`)); return false; }

  const demoRes = await runGrader(guideDir, { target: demoTarget });
  const negRes = await runGrader(guideDir, { target: negTarget });

  const demoOk = demoRes.fail === 0 && demoRes.pass > 0;
  const negOk = negRes.fail >= 1;
  const ok = demoOk && negOk;

  const label = path.relative(process.cwd(), guideDir);
  if (ok) console.log(`${cGreen('✓')} ${label}  ${cDim(`demo ${demoRes.pass}/${demoRes.pass + demoRes.fail}, negative ${negRes.fail} fail`)}`);
  else {
    console.error(`${cRed('✗')} ${label}`);
    if (!demoOk) console.error(`    demo expected all pass, got ${demoRes.pass}/${demoRes.pass + demoRes.fail}`);
    if (!negOk) console.error(`    negative-demo expected ≥1 fail, got 0`);
    if (opts.verbose) {
      console.error(`    --- demo stdout ---\n${demoRes.stdout}`);
      console.error(`    --- negative stdout ---\n${negRes.stdout}`);
    }
  }
  return ok;
}

function firstCs(dir: string): string | null {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.cs')) return path.join(dir, entry.name);
  }
  return null;
}
```

- [ ] **Step 3: Verify**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/test-grader.test.ts --test-timeout 60000
node --experimental-strip-types bin/ggdd-dev.ts test-grader --guide guides/unity-engine/new-input-system-basics
```
Expected: test passes; CLI prints `✓ guides/unity-engine/new-input-system-basics demo 6/6, negative 4 fail`, exits 0.

- [ ] **Step 4: Commit**

```bash
git add guides/test-grader.ts guides/test-grader.test.ts
git commit -m "feat(guides): test-grader enforces demo-passes + negative-fails calibration"
```

---

## Task 4: `audit` + `dev-all`

**Files:**
- Create: `guides/dev-guide.ts`
- Create: `guides/dev-guide.test.ts`

`audit` walks the catalog and prints a status table (does each guide have all required artifacts?). `dev-all --test-grader` runs `test-grader` against every guide; non-zero exit if any fail.

- [ ] **Step 1: Write failing test**

`guides/dev-guide.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { auditGuides, devAll } from './dev-guide.ts';

test('auditGuides returns true when all 12 seed guides have full artifacts', async () => {
  const ok = await auditGuides({ verbose: false });
  assert.equal(ok, true);
});

test('devAll --test-grader passes for all 12 calibrated graders', async () => {
  const ok = await devAll({ verbose: false, testGraderOnly: true });
  assert.equal(ok, true);
});
```

- [ ] **Step 2: Implement `dev-guide.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { collectGuides, type CatalogEntry } from '../lib/catalog.ts';
import { cBold, cCyan, cGreen, cRed, cDim, cYellow } from '../lib/colors.ts';
import { testGrader } from './test-grader.ts';

export interface AuditOptions { verbose?: boolean }
export interface DevOptions { verbose?: boolean }
export interface DevAllOptions { verbose?: boolean; testGraderOnly?: boolean }

interface ArtifactStatus {
  guide: boolean; expectations: boolean; task: boolean;
  demo: boolean; negativeDemo: boolean; grader: boolean;
}

function checkArtifacts(e: CatalogEntry): ArtifactStatus {
  return {
    guide: fs.existsSync(e.guidePath),
    expectations: fs.existsSync(path.join(e.dir, 'expectations.md')),
    task: fs.existsSync(path.join(e.dir, 'tasks', 'task.md')),
    demo: fs.existsSync(path.join(e.dir, 'demo')) && fs.readdirSync(path.join(e.dir, 'demo')).some(f => f.endsWith('.cs')),
    negativeDemo: fs.existsSync(path.join(e.dir, 'negative-demo')) && fs.readdirSync(path.join(e.dir, 'negative-demo')).some(f => f.endsWith('.cs')),
    grader: fs.existsSync(path.join(e.dir, 'grader.ts')),
  };
}

function statusGlyph(b: boolean): string { return b ? cGreen('✓') : cRed('✗'); }

export async function auditGuides(opts: AuditOptions = {}): Promise<boolean> {
  const entries = collectGuides();
  console.log(`\n${cBold(`Audit: ${entries.length} guide(s)`)}\n`);
  console.log(`${cDim('id'.padEnd(40))}  G  E  T  D  N  R`);

  let allOk = true;
  const byCategory = new Map<string, CatalogEntry[]>();
  for (const e of entries) {
    const list = byCategory.get(e.category) ?? [];
    list.push(e); byCategory.set(e.category, list);
  }

  for (const [cat, list] of byCategory) {
    console.log(`\n${cCyan(cat)}`);
    for (const e of list) {
      const s = checkArtifacts(e);
      const ok = s.guide && s.expectations && s.task && s.demo && s.negativeDemo && s.grader;
      if (!ok) allOk = false;
      const cols = [s.guide, s.expectations, s.task, s.demo, s.negativeDemo, s.grader].map(statusGlyph).join('  ');
      console.log(`  ${e.id.padEnd(38)}  ${cols}`);
    }
  }

  console.log();
  return allOk;
}

export async function devGuide(guideDir: string, opts: DevOptions = {}): Promise<boolean> {
  // Plan 3 scope: just run test-grader. The full author loop (gen-negative, gen-grader,
  // guided agent test) is wired up here but only test-grader is required for v1.
  console.log(cBold(`dev ${guideDir}`));
  return await testGrader(guideDir, opts);
}

export async function devAll(opts: DevAllOptions = {}): Promise<boolean> {
  const entries = collectGuides();
  let allOk = true;
  for (const e of entries) {
    const ok = await testGrader(e.dir, { verbose: opts.verbose });
    if (!ok) allOk = false;
  }
  if (allOk) console.log(cGreen(`\nAll ${entries.length} graders calibrated.`));
  else console.error(cRed(`\nCalibration failures found.`));
  return allOk;
}
```

- [ ] **Step 3: Verify**

```bash
node --experimental-strip-types --test guides/dev-guide.test.ts --test-timeout 120000
node --experimental-strip-types bin/ggdd-dev.ts audit
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader
```
Expected: 2 unit tests pass; audit prints 12 rows all ✓; dev-all reports `All 12 graders calibrated.`, exits 0.

- [ ] **Step 4: Commit**

```bash
git add guides/dev-guide.ts guides/dev-guide.test.ts
git commit -m "feat(guides): audit + dev-all commands; dev wraps test-grader for now"
```

---

## Task 5: Anthropic-driven `gen-negative` + `gen-grader`

**Files:**
- Create: `guides/anthropic-client.ts`
- Create: `guides/negative-gen.ts`
- Create: `guides/grader-gen.ts`

These call the Anthropic API to scaffold a missing `negative-demo/*.cs` or `grader.ts`. They require `ANTHROPIC_API_KEY` in `.env`. The plan loads `.env` automatically via `process.loadEnvFile` (Node 20+). If the key is missing, the commands fail with a clear message instead of crashing.

Plan 3 does NOT exercise the LLM in tests (would consume real API quota). The Node tests verify the failure path (missing key) and the request-construction path (uses `dryRun` mode).

- [ ] **Step 1: Implement shared `anthropic-client.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';

export interface RequestOpts {
  /** When true, returns the constructed messages payload instead of calling the API. Used in tests. */
  dryRun?: boolean;
}

export class MissingAnthropicKeyError extends Error {
  constructor() { super('ANTHROPIC_API_KEY not set. Add it to .env or export it.'); this.name = 'MissingAnthropicKeyError'; }
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingAnthropicKeyError();
  return _client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export interface CompleteArgs {
  system: string;
  user: string;
  maxTokens?: number;
}

export async function complete(args: CompleteArgs, opts: RequestOpts = {}): Promise<string> {
  const payload = {
    model: 'claude-sonnet-4-6',
    max_tokens: args.maxTokens ?? 2048,
    system: [{ type: 'text' as const, text: args.system, cache_control: { type: 'ephemeral' as const } }],
    messages: [{ role: 'user' as const, content: args.user }],
  };
  if (opts.dryRun) return JSON.stringify(payload);

  const client = getClient();
  const resp = await client.messages.create(payload);
  const block = resp.content[0];
  if (block.type !== 'text') throw new Error(`Unexpected content block type: ${block.type}`);
  return block.text;
}
```

- [ ] **Step 2: Implement `negative-gen.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { complete } from './anthropic-client.ts';
import { cBold, cDim, cGreen } from '../lib/colors.ts';

const SYSTEM = `You are scaffolding a "negative demo" C# file for a Unity 6 ggdd guide.
A negative demo deliberately VIOLATES the patterns the guide teaches — it represents what an
agent might write before applying the guide. The grader uses this to verify calibration.

Output ONLY the C# source. No markdown fences, no commentary. Use the exact same class name
and method signatures as the demo, but with the anti-pattern inverted (legacy APIs, missing
caching, missing guards, etc.).`;

export async function generateNegative(guideDir: string): Promise<void> {
  const guideMd = fs.readFileSync(path.join(guideDir, 'guide.md'), 'utf8');
  const demoDir = path.join(guideDir, 'demo');
  if (!fs.existsSync(demoDir)) throw new Error(`No demo/ at ${guideDir}`);
  const demoFile = fs.readdirSync(demoDir).find(f => f.endsWith('.cs'));
  if (!demoFile) throw new Error(`No .cs file under ${demoDir}`);
  const demoSrc = fs.readFileSync(path.join(demoDir, demoFile), 'utf8');

  const user = `Guide:\n\n${guideMd}\n\n---\n\nReference (correct) demo file \`${demoFile}\`:\n\n\`\`\`csharp\n${demoSrc}\n\`\`\`\n\nProduce the matching negative-demo (anti-pattern) C# source.`;

  console.log(cBold(`gen-negative ${guideDir}`));
  const text = await complete({ system: SYSTEM, user });

  const outDir = path.join(guideDir, 'negative-demo');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, demoFile);
  fs.writeFileSync(outPath, text.trim() + '\n');
  console.log(`${cGreen('✓')} wrote ${outPath} ${cDim(`(${text.length} chars)`)}`);
}
```

- [ ] **Step 3: Implement `grader-gen.ts`**

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { complete } from './anthropic-client.ts';
import { cBold, cDim, cGreen } from '../lib/colors.ts';

const SYSTEM = `You are scaffolding a node:test-based grader.ts file for a Unity 6 ggdd guide.

The grader is a TypeScript file invoked as: \`node --experimental-strip-types --test grader.ts\`.

It must:
1. Import from '../../test-fixture.ts' — available helpers: readCSharp, hasPattern, hasNoPattern,
   usesNamespace, declaresType, methodCallsAst, serializedAssetField.
2. Compute TARGET from process.env.TARGET_FILE (fallback to path.join(import.meta.dirname, 'demo', '<file>.cs')).
3. Define tests using \`import { test } from 'node:test'\` + \`import assert from 'node:assert'\`.
4. Each test asserts a SPECIFIC pattern from the guide's expectations.md.

Output ONLY the TypeScript source. No markdown fences, no commentary. The grader should pass
against the demo file (all assertions true) and fail at least one assertion against the
negative-demo file.`;

export async function generateGrader(guideDir: string): Promise<void> {
  const guideMd = fs.readFileSync(path.join(guideDir, 'guide.md'), 'utf8');
  const expectations = fs.readFileSync(path.join(guideDir, 'expectations.md'), 'utf8');
  const demoDir = path.join(guideDir, 'demo');
  const demoFile = fs.readdirSync(demoDir).find(f => f.endsWith('.cs'))!;
  const demoSrc = fs.readFileSync(path.join(demoDir, demoFile), 'utf8');

  const user = `Guide:\n\n${guideMd}\n\nExpectations:\n\n${expectations}\n\nDemo (\`${demoFile}\`):\n\n\`\`\`csharp\n${demoSrc}\n\`\`\`\n\nWrite grader.ts.`;

  console.log(cBold(`gen-grader ${guideDir}`));
  const text = await complete({ system: SYSTEM, user });

  const outPath = path.join(guideDir, 'grader.ts');
  fs.writeFileSync(outPath, text.trim() + '\n');
  console.log(`${cGreen('✓')} wrote ${outPath} ${cDim(`(${text.length} chars)`)}`);
}
```

- [ ] **Step 4: Add a small smoke test for the dry-run path**

`guides/anthropic-client.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { complete, MissingAnthropicKeyError } from './anthropic-client.ts';

test('complete in dryRun mode returns the request payload (no API call)', async () => {
  const out = await complete({ system: 's', user: 'u' }, { dryRun: true });
  const payload = JSON.parse(out);
  assert.equal(payload.model, 'claude-sonnet-4-6');
  assert.equal(payload.messages[0].content, 'u');
  assert.equal(payload.system[0].text, 's');
  assert.equal(payload.system[0].cache_control.type, 'ephemeral');
});

test('complete throws MissingAnthropicKeyError when key is missing', async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    await assert.rejects(() => complete({ system: 's', user: 'u' }), MissingAnthropicKeyError);
  } finally {
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});
```

- [ ] **Step 5: Verify**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/anthropic-client.test.ts
# CLI smoke (should fail with clear message when no API key):
unset ANTHROPIC_API_KEY
node --experimental-strip-types bin/ggdd-dev.ts gen-negative --guide guides/unity-engine/new-input-system-basics 2>&1 | head -3
```
Expected: 2 tests pass; CLI prints the missing-key error and exits non-zero.

- [ ] **Step 6: Commit**

```bash
git add guides/anthropic-client.ts guides/anthropic-client.test.ts guides/negative-gen.ts guides/grader-gen.ts
git commit -m "feat(guides): Anthropic-driven gen-negative + gen-grader (with dry-run path)"
```

---

## Task 6: CI calibration gate

**Files:**
- Modify: `.github/workflows/preflight.yml` (add a step that runs `ggdd-dev dev-all --test-grader`)

Addresses Plan 2 PR follow-up #1: CI now enforces that every grader passes against its demo AND fails against its negative-demo.

- [ ] **Step 1: Modify `.github/workflows/preflight.yml`**

Append a step before the bundler step:

```yaml
      - name: Calibrate all graders (dev-all --test-grader)
        run: |
          node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader
```

The full final file should look like (replacing the existing one):

```yaml
name: Preflight

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  preflight:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true
      - name: Pull LFS files
        run: git lfs pull
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install root devDependencies (npm, bypasses pnpm OOM)
        run: npm install --ignore-scripts --no-audit --no-fund
      - name: Install serving package (npm, bypasses pnpm OOM)
        run: |
          cd serving
          npm install --ignore-scripts --no-audit --no-fund
      - name: Run root tests
        run: node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts'
      - name: Run serving tests
        run: |
          cd serving
          node --experimental-strip-types --test --test-timeout 60000 'lib/**/*.test.ts' 'bin/**/*.test.ts' 'mcp-server/**/*.test.ts' 'scripts/**/*.test.ts' 'skills-cli/**/*.test.ts'
      - name: Calibrate all graders (dev-all --test-grader)
        run: node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader
      - name: Verify serving package builds (esbuild bundler)
        run: |
          cd serving
          node --experimental-strip-types scripts/build-guides.ts
          node --experimental-strip-types skills-cli/build-dist.ts
          test -f build/ggdd.js && test -f build/mcp-server.js
```

Also note: root tests now glob both `lib/**` AND `guides/**` so `guides/test-fixture.test.ts`, `guides/run-grader.test.ts`, etc. all execute.

- [ ] **Step 2: Run locally to confirm**

```bash
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts' 2>&1 | tail -3
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
```
Expected: tests pass; dev-all reports `All 12 graders calibrated.`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/preflight.yml
git commit -m "ci(preflight): run ggdd-dev dev-all --test-grader to enforce calibration"
```

---

## Task 7: CONTEXT.md + tag

- [ ] **Step 1: Update `CONTEXT.md`**

Update the `bin/` entry under "Top-level layout":

Replace:
```
- `bin/` — root dev CLI (`ggdd-dev`, Plan 3). Not published.
```

With:
```
- `bin/` — root dev CLI `ggdd-dev` (Plan 3). Commands: `audit`, `dev`, `dev-all`, `gen-grader`, `gen-negative`, `test-grader`, `grade`, `warm-cache` (placeholder), `apiref` (placeholder), `setup-completion`. Not published.
```

Append to Active TODOs (preserving existing entries):
```
- **LLM generators need ANTHROPIC_API_KEY** to run. Add it to `.env` for `ggdd-dev gen-grader` / `gen-negative`. The dry-run path is exercised in tests so no API quota is consumed by CI.
- **`dev` is currently a thin wrapper around `test-grader`.** The full author loop (auto-generate negative/grader if missing, then run guided agent test) lands when Plan 4's harness ships the agent runners.
```

- [ ] **Step 2: Final preflight + tag**

```bash
cd /Users/lijinglue/repo/ggdd
# Full preflight
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts' 2>&1 | tail -3
cd serving && node --experimental-strip-types --test --test-timeout 60000 'lib/**/*.test.ts' 'bin/**/*.test.ts' 'mcp-server/**/*.test.ts' 'scripts/**/*.test.ts' 'skills-cli/**/*.test.ts' 2>&1 | tail -3
cd .. && node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
cd serving && node --experimental-strip-types skills-cli/build-dist.ts
cd ..

# Commit + tag
git add CONTEXT.md
git commit -m "docs: update CONTEXT.md with Plan 3 authoring-CLI scope notes"
git tag v0.3.0-plan3
git log --oneline | head -10
```

Expected: all green; tag created.

---

## Plan 3 acceptance checks

- [ ] `node --experimental-strip-types bin/ggdd-dev.ts --help` lists 10 commands
- [ ] `node --experimental-strip-types bin/ggdd-dev.ts audit` shows 12 rows, all `✓`
- [ ] `node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader` exits 0
- [ ] `node --experimental-strip-types bin/ggdd-dev.ts grade --guide guides/unity-engine/new-input-system-basics` prints `6 pass, 0 fail`
- [ ] `node --experimental-strip-types bin/ggdd-dev.ts gen-negative --guide …` fails cleanly when `ANTHROPIC_API_KEY` is unset
- [ ] CI workflow includes the calibration step
- [ ] Tag `v0.3.0-plan3`

---

## Out of scope for Plan 3 (lands later)

- **Plan 4:** Unity 6 base-apps (committed via git LFS), `unityCompile`/`unityRunEditModeTests` helpers, agent runners (claude-code/codex/gemini/jetski), `ggdd-dev warm-cache` real implementation, `ggdd-dev eval` against real agents.
- **Plan 5:** `eval-view/` dashboard.
- **Plan 6:** npm publish flow + Claude Code plugin marketplace registration.

## Self-review notes

- **Spec coverage:** Plan 3 implements §7 of the design doc except the `eval`, `run`, `dashboard`, `deploy`, `upload`, `backfill` commands (which need Plan 4's harness) and the `warm-cache` real implementation. Both groups are stubbed clearly.
- **No placeholders:** every step contains real code or commands.
- **Type consistency:** `CatalogEntry`, `GraderResult`, `TestGraderOptions`, etc., names are consistent across files. `runGrader`, `testGrader`, `auditGuides`, `devAll`, `devGuide` all use the same `{ verbose }` convention.
