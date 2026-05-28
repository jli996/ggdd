# ggdd Plan 6 — Distribution (npm publish + Claude Code plugin)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make `ggdd` actually installable. Address every Plan 1–5 follow-up that blocks a public v1: bin path swap, `engines` field, telemetry decision, per-assertion population, Claude Code plugin manifest finalized, README install instructions. Cut release tag `v1.0.0`. Document the manual `npm publish` step (Plan 6 does NOT execute the publish — that needs the user's npm credentials).

**Architecture:** Two changes drive everything:
1. `serving/package.json`'s `bin` field switches from `bin/ggdd.ts` (works only with Node `--experimental-strip-types` shebang) to `build/ggdd.js` (the esbuild-bundled artifact, runs on plain Node 22+). A `prepublishOnly` script ensures `build/` is fresh before publish.
2. The published `serving/build/` tree must be self-contained: the bundle, the vendored MiniLM model, the SKILL.md template, and the plugin.json. `build-dist.ts` is extended to also copy the model directory and SKILL template into `build/`.

Additionally, Plan 5's per-assertion drilldown is wired up by parsing `node:test` TAP-style output in `harness/run_suite.ts` (cheap improvement). Telemetry is stripped (per CONTEXT.md TODO: lean toward (b) — remove rather than wire to a real endpoint).

**Tech Stack:** No new runtime deps. Node 22+ (becomes the official minimum). npm (not pnpm).

**Branch:** `feature/plan-6-distribution` (off `main`, after PR #5 merged at `5b8d61a`).

---

## File map

```
/Users/lijinglue/repo/ggdd/
├── serving/
│   ├── package.json                              # MODIFY (bin, engines, prepublishOnly, files)
│   ├── bin/ggdd.ts                               # MODIFY (drop ClearcutLogger imports)
│   ├── skills-cli/
│   │   ├── build-dist.ts                         # MODIFY (copy model + template into build/)
│   │   ├── build-dist.test.ts                    # MODIFY (assert model + template present in build/)
│   │   ├── telemetry/                            # DELETE — strip the no-op stub entirely
│   │   └── template/
│   │       ├── SKILL.md                          # MODIFY (v1 messaging)
│   │       ├── plugin.json                       # MODIFY (1.0.0)
│   │       └── skill-version.txt                 # MODIFY (2026_05_28_v1)
│   └── README.md                                 # NEW — npm-published package README
├── harness/run_suite.ts                          # MODIFY (parse per-assertion from grader output)
├── README.md                                     # MODIFY (npx ggdd install flow)
├── bin/ggdd-dev.ts                               # MODIFY (drop telemetry imports if any leaked)
└── CONTEXT.md                                    # MODIFY
```

---

## Task 1: Strip telemetry stub

**Files:** delete `serving/skills-cli/telemetry/`; modify `serving/bin/ggdd.ts` to remove the imports + call sites.

Per the CONTEXT.md TODO, we lean toward (b) — strip the code entirely. Telemetry can always be re-added if a real opt-in endpoint becomes worthwhile.

- [ ] **Step 1: Remove telemetry usage from `serving/bin/ggdd.ts`**

Delete these lines (top of file):

```typescript
import { ClearcutLogger } from '../skills-cli/telemetry/ClearcutLogger.ts';
import { CommandType } from '../skills-cli/telemetry/types.ts';
```

Delete this block inside `main()` (the lazy logger init):

```typescript
  const skillVersion = typeof values['skill-version'] === 'string' ? values['skill-version'] : null;
  let loggerInstance: ClearcutLogger | undefined;
  const getLogger = () => loggerInstance ??= new ClearcutLogger({ skillVersion });
```

Replace with just:

```typescript
  const skillVersion = typeof values['skill-version'] === 'string' ? values['skill-version'] : null;
```

Then **remove every `await getLogger().log*(...)` call site** in the search/list/retrieve/install/uninstall/update handlers. Some examples to delete:

- `await getLogger().logSearchResult(...)` (3 places in search)
- `await getLogger().logRetrieveResult(...)` (2 places in retrieve)
- `await getLogger().logToolCommand(...)` (3 places: install/uninstall/update)

Keep all other logic — only the telemetry calls go away.

- [ ] **Step 2: Delete the telemetry directory**

```bash
cd /Users/lijinglue/repo/ggdd
rm -rf serving/skills-cli/telemetry
```

- [ ] **Step 3: Verify the CLI still runs + tests pass**

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types bin/ggdd.ts --version
node --experimental-strip-types --test --test-timeout 60000 'bin/**/*.test.ts'
```

Expected: version prints; bin tests still pass (they don't depend on telemetry).

- [ ] **Step 4: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add -A serving/bin/ggdd.ts serving/skills-cli/telemetry
git commit -m "refactor(serving): strip ClearcutLogger stub (per CONTEXT TODO — option b)"
```

---

## Task 2: Switch published `bin` to the built artifact + add `engines`

**Files:** `serving/package.json`

- [ ] **Step 1: Update `serving/package.json`**

Change:

```json
  "bin": {
    "ggdd": "bin/ggdd.ts"
  },
```

To:

```json
  "bin": {
    "ggdd": "build/ggdd.js"
  },
```

Add at top level (after `"license"`):

```json
  "engines": {
    "node": ">=22"
  },
```

Change `"files"` to include the bundled model + templates that ship with the build:

```json
  "files": [
    "build",
    "README.md"
  ],
```

(Drop `bin`, `lib`, `mcp-server`, `megaskill`, `skills-cli/template` from `files` — they're all snapshotted into `build/` by Task 3's build-dist update.)

Add a `prepublishOnly` script:

```json
    "prepublishOnly": "node --experimental-strip-types scripts/build-guides.ts && node --experimental-strip-types skills-cli/build-dist.ts",
```

(Insert into the `"scripts"` object alongside `"build"`.)

- [ ] **Step 2: Commit**

```bash
git add serving/package.json
git commit -m "feat(serving): switch published bin to build/ggdd.js + add engines >=22 + prepublishOnly"
```

---

## Task 3: Self-contained `build/` (copy model + template into build/)

**Files:** `serving/skills-cli/build-dist.ts`, `serving/skills-cli/build-dist.test.ts`

The published npm tarball needs everything to run standalone. Currently `build-dist.ts` only emits `build/ggdd.js` + `build/mcp-server.js`. It must also copy:
- `lib/tfjs_model_minilm/` (vendored model)
- `lib/use-cases.gen.ts` + `lib/embeddings.gen.bin` (generated corpus)
- `skills-cli/template/` (SKILL.md + plugin.json + skill-version.txt)
- `megaskill/megaskill.md`

Also the bundle's runtime path resolution: code like `path.join(__dirname, 'tfjs_model_minilm', ...)` currently resolves relative to where `bin/ggdd.ts` lives in source. In the bundled `build/ggdd.js`, `__dirname` is `serving/build/`. So we need to copy the model + corpus to `serving/build/` (NOT `serving/build/lib/`) so paths line up.

Easiest pattern: rebase the bundle to assume `build/` IS `lib/`. Let me lay out the destination layout:

```
serving/build/
├── ggdd.js                       # bundled CLI
├── mcp-server.js                 # bundled MCP server
├── tfjs_model_minilm/            # copied from serving/lib/tfjs_model_minilm/
├── use-cases.gen.ts              # copied from serving/lib/
├── embeddings.gen.bin            # copied from serving/lib/
├── megaskill.md                  # copied from serving/megaskill/
├── SKILL.md                      # copied from serving/skills-cli/template/
├── plugin.json                   # copied from serving/skills-cli/template/
└── skill-version.txt             # copied from serving/skills-cli/template/
```

- [ ] **Step 1: Update `serving/skills-cli/build-dist.ts`**

Replace the existing file with:

```typescript
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVING = path.resolve(__dirname, '..');
const BUILD = path.join(SERVING, 'build');

const EXTERNAL = [
  '@tensorflow/tfjs-core',
  '@tensorflow/tfjs-converter',
  '@tensorflow/tfjs-backend-cpu',
  '@huggingface/transformers',
  '@modelcontextprotocol/sdk',
  'gray-matter',
  'zod',
  'onnxruntime-node',
];

function copyDirRecursive(src: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFileIfExists(src: string, dst: string): boolean {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return true;
}

export async function buildDist(): Promise<void> {
  // Clean + recreate.
  if (fs.existsSync(BUILD)) fs.rmSync(BUILD, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });

  // Bundle the CLI + MCP server.
  await esbuild.build({
    entryPoints: [path.join(SERVING, 'bin', 'ggdd.ts')],
    bundle: true, format: 'esm', platform: 'node', target: 'node22',
    outfile: path.join(BUILD, 'ggdd.js'),
    external: EXTERNAL,
    banner: { js: '#!/usr/bin/env node' },
    loader: { '.ts': 'ts' },
  });
  await esbuild.build({
    entryPoints: [path.join(SERVING, 'mcp-server', 'index.ts')],
    bundle: true, format: 'esm', platform: 'node', target: 'node22',
    outfile: path.join(BUILD, 'mcp-server.js'),
    external: EXTERNAL,
    banner: { js: '#!/usr/bin/env node' },
    loader: { '.ts': 'ts' },
  });

  // Make built files executable.
  fs.chmodSync(path.join(BUILD, 'ggdd.js'), 0o755);
  fs.chmodSync(path.join(BUILD, 'mcp-server.js'), 0o755);

  // Copy vendored model + generated corpus next to the bundled files
  // (the bundle's __dirname-relative reads resolve here).
  copyDirRecursive(path.join(SERVING, 'lib', 'tfjs_model_minilm'), path.join(BUILD, 'tfjs_model_minilm'));
  copyFileIfExists(path.join(SERVING, 'lib', 'use-cases.gen.ts'), path.join(BUILD, 'use-cases.gen.ts'));
  copyFileIfExists(path.join(SERVING, 'lib', 'embeddings.gen.bin'), path.join(BUILD, 'embeddings.gen.bin'));

  // Copy megaskill + SKILL.md + plugin.json + skill-version.txt.
  copyFileIfExists(path.join(SERVING, 'megaskill', 'megaskill.md'), path.join(BUILD, 'megaskill.md'));
  copyFileIfExists(path.join(SERVING, 'skills-cli', 'template', 'SKILL.md'), path.join(BUILD, 'SKILL.md'));
  copyFileIfExists(path.join(SERVING, 'skills-cli', 'template', 'plugin.json'), path.join(BUILD, 'plugin.json'));
  copyFileIfExists(path.join(SERVING, 'skills-cli', 'template', 'skill-version.txt'), path.join(BUILD, 'skill-version.txt'));
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  await buildDist();
  console.log(`Built to ${BUILD}`);
}
```

- [ ] **Step 2: Update `serving/skills-cli/build-dist.test.ts`**

Replace with assertions that confirm the full self-contained set:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDist } from './build-dist.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVING = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(SERVING, 'build');

test('buildDist produces a self-contained build/ directory', async () => {
  if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true });
  await buildDist();
  for (const f of ['ggdd.js', 'mcp-server.js', 'use-cases.gen.ts', 'embeddings.gen.bin', 'SKILL.md', 'plugin.json', 'skill-version.txt', 'megaskill.md']) {
    assert.ok(fs.existsSync(path.join(BUILD_DIR, f)), `missing ${f}`);
  }
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'tfjs_model_minilm', 'model.json')), 'missing model.json');
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'tfjs_model_minilm', 'group1-shard1of1.bin')), 'missing model weights');
});

test('bundled ggdd.js has the node shebang', () => {
  const src = fs.readFileSync(path.join(BUILD_DIR, 'ggdd.js'), 'utf8');
  assert.match(src.split('\n')[0], /^#!\/usr\/bin\/env node/);
});

test('bundled ggdd.js is executable + reports the right version', async () => {
  const { execFileSync } = await import('node:child_process');
  const stat = fs.statSync(path.join(BUILD_DIR, 'ggdd.js'));
  assert.equal(stat.mode & 0o111, 0o111);
  const out = execFileSync(path.join(BUILD_DIR, 'ggdd.js'), ['--version'], { encoding: 'utf8' }).trim();
  assert.match(out, /^\d+\.\d+\.\d+/);
});
```

- [ ] **Step 3: Run + commit**

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types --test skills-cli/build-dist.test.ts --test-timeout 60000
ls -la build/ | head -20
node build/ggdd.js search "input system" | head -c 60
```

Expected: 3 tests pass; `build/` listing shows all required files; bundled `search` produces JSON output.

- [ ] **Step 4: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add serving/skills-cli/build-dist.ts serving/skills-cli/build-dist.test.ts
git commit -m "feat(serving): build-dist copies model + corpus + templates into self-contained build/"
```

---

## Task 4: Wire per-assertion population in harness

**Files:** `harness/run_suite.ts`, `guides/run-grader.ts`

`grader.ts` files use `node:test`. The summary output includes per-test pass/fail lines we can parse — but a simpler approach is to extend `run-grader.ts` to also return a `perAssertion: Array<{name, passed, message?}>` extracted from the test runner's output, and have `run_suite.ts` propagate that into the `RunResult`.

- [ ] **Step 1: Extend `guides/run-grader.ts`**

Update `GraderResult` interface and parsing logic:

```typescript
// Add to GraderResult:
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
```

And in the resolver block, replace the existing pass/fail parsing with:

```typescript
    child.on('close', () => {
      clearTimeout(t);
      // node:test summary lines like `# pass 5` and `# fail 1` (Node 22+) or `ℹ pass 5` (Node 24+).
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
```

- [ ] **Step 2: Update `harness/run_suite.ts`**

In the `runSingle()` function, set the `perAssertion` field from the grader result instead of an empty array:

```typescript
  return {
    guideId: task.guideId,
    agent: agent.id,
    modelVersion: agent.defaultModel,
    grader: {
      pass: grader.pass, fail: grader.fail, total,
      rate: total > 0 ? grader.pass / total : 0,
      perAssertion: grader.perAssertion,
    },
    agentDurationMs,
    totalDurationMs: Date.now() - startTotal,
    exitCode: agentRes.exitCode,
  };
```

- [ ] **Step 3: Add a quick test that perAssertion is populated**

Append to `guides/run-grader.test.ts`:

```typescript
test('runGrader returns perAssertion array with named entries', async () => {
  const res = await runGrader(path.join(rootDir, 'guides', 'unity-engine', 'new-input-system-basics'));
  assert.ok(Array.isArray(res.perAssertion));
  assert.ok(res.perAssertion.length >= 1, `expected perAssertion entries, got ${res.perAssertion.length}`);
  assert.ok(res.perAssertion.every(a => typeof a.name === 'string' && typeof a.passed === 'boolean'));
});
```

- [ ] **Step 4: Run + commit**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/run-grader.test.ts --test-timeout 60000 2>&1 | tail -5
```

Expected: 4 tests pass (3 original + 1 new).

- [ ] **Step 5: Commit**

```bash
git add guides/run-grader.ts guides/run-grader.test.ts harness/run_suite.ts
git commit -m "feat(harness): populate RunResult.grader.perAssertion from node:test output"
```

---

## Task 5: v1 SKILL.md + plugin.json + skill-version.txt

**Files:** `serving/skills-cli/template/{SKILL.md, plugin.json, skill-version.txt}`

- [ ] **Step 1: Update `skill-version.txt`**

```
2026_05_28_v1
```

- [ ] **Step 2: Update `plugin.json` version to 1.0.0**

```json
{
  "name": "ggdd",
  "version": "1.0.0",
  "description": "Game Guidance for Development Done-right — curated Unity 6 guidance for coding agents",
  "author": {
    "name": "lijinglue",
    "email": "ljlxdev@gmail.com"
  },
  "homepage": "https://github.com/jli996/ggdd",
  "skills": [
    {
      "name": "ggdd",
      "source": "./SKILL.md"
    }
  ]
}
```

- [ ] **Step 3: Update `SKILL.md`**

```markdown
---
name: ggdd
description: Use when working with Unity 6 — searches and retrieves curated guidance on engine APIs (URP, Input System, Addressables, ScriptableObjects), performance (GC, draw calls, SRP Batcher, object pooling), and game-design patterns for action and deckbuilder genres. Triggers on Unity C# scripts, .unity scenes, ScriptableObjects, or genre-specific design questions.
version: 2026_05_28_v1
---

# ggdd — Unity 6 guidance

When the user asks for help with Unity 6 engine usage, performance, or game-design patterns (action/brawler, deckbuilder/roguelite), follow this workflow:

1. **Search** for the most relevant guide:

   ```shell
   npx ggdd@latest --skill-version 2026_05_28_v1 search "<short natural-language query>"
   ```

   Returns a JSON array of `{ id, category, useCase, description, similarity }` ranked by relevance. Pick the top 1–3 that match the user's task. Empty array means no relevant guidance exists — proceed without it rather than forcing an unrelated guide.

2. **Retrieve** the full guide markdown:

   ```shell
   npx ggdd@latest --skill-version 2026_05_28_v1 retrieve "<id-1>,<id-2>"
   ```

3. **Apply** the guidance. The `## Avoid` and `## Gotchas` sections in each guide are particularly load-bearing.

Prefer modern Unity 6 patterns:
- `UnityEngine.InputSystem` over `UnityEngine.Input`
- URP over Built-in Render Pipeline
- `UnityEngine.Pool.ObjectPool<T>` over hand-rolled pools or bare `Instantiate`/`Destroy`
- Async `Addressables.LoadAssetAsync` / `InstantiateAsync` over `Resources.Load`
- `ScriptableObject` assets over singleton `MonoBehaviour` patterns

## When NOT to use this skill

- Non-Unity C# work (web APIs, console apps).
- Unity 2022 LTS or 2021 LTS specifically — ggdd targets Unity 6 only.
- Asset creation (3D modeling, texturing, shader authoring) — ggdd is code/architecture guidance.
- Unrelated game-design questions outside action and deckbuilder genres (current v1 scope).
```

- [ ] **Step 4: Run the SKILL.md/plugin.json tests**

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types --test skills-cli/template/plugin-json.test.ts
```

Expected: all tests still pass; version match assertion against skill-version.txt succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/lijinglue/repo/ggdd
git add serving/skills-cli/template/
git commit -m "feat(serving): v1 SKILL.md + plugin.json + skill-version.txt (2026_05_28_v1)"
```

---

## Task 6: README updates for install flow

**Files:** `README.md` (root), `serving/README.md` (NEW — the package README that ships with the published tarball)

- [ ] **Step 1: Create `serving/README.md`**

```markdown
# ggdd

Game Guidance for Development Done-right — curated Unity 6 guidance for coding agents.

\`\`\`shell
npx ggdd@latest install
\`\`\`

Drops `SKILL.md` + `plugin.json` so your coding agent (Claude Code, Codex, Gemini CLI, etc.) can discover and consume the guidance via two CLI commands.

## Try it without installing

\`\`\`shell
# Search the catalog
npx ggdd@latest search "object pooling in Unity"

# Retrieve a guide
npx ggdd@latest retrieve "object-pooling-basics"

# List all 12 guides
npx ggdd@latest list
\`\`\`

## What's included

12 calibrated guides across four categories:

- **unity-engine**: new-input-system-basics, addressables-load-async, scriptableobject-shared-state
- **unity-performance**: gc-free-update-loop, object-pooling-basics, urp-srp-batcher-friendly-materials
- **game-design-action**: hit-stop-on-impact, input-buffering, knockback-with-control-takeback
- **game-design-deckbuilder**: run-pacing-3-act-structure, card-rarity-without-power-creep, relic-stacking-readability

Each guide ships with a behavior-graded test that checks whether agent-produced code follows the recommended pattern.

## How it works

The CLI runs offline. Embeddings for the guide catalog are pre-computed using a vendored MiniLM model (TF.js, CPU backend). Search is a single cosine-similarity scan over ~60 use-case vectors. Zero network calls, zero API keys.

## MCP server

The package also ships an MCP server. Add it to your client config:

\`\`\`json
{
  "mcpServers": {
    "ggdd": {
      "command": "npx",
      "args": ["-y", "ggdd@latest", "mcp-server"]
    }
  }
}
\`\`\`

Exposes two tools: `ggdd_search` and `ggdd_retrieve`.

## Requires

Node 22 or newer.

## License

Apache-2.0.
```

- [ ] **Step 2: Update root `README.md`**

Replace the existing "Quickstart (Plan 1 scope)" section with:

```markdown
## Quickstart

\`\`\`shell
# Install the skill in your coding agent:
npx ggdd@latest install

# Or use the search/retrieve commands directly:
npx ggdd@latest search "input system in Unity"
npx ggdd@latest retrieve "new-input-system-basics"
\`\`\`

See [`serving/README.md`](./serving/README.md) for end-user documentation.
\`\`\`

## Development

\`\`\`shell
# Use npm (not pnpm — see CONTEXT.md for the OOM workaround):
npm install --ignore-scripts
cd serving && npm install --ignore-scripts && cd ..

# Run the full preflight
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts'
cd serving && node --experimental-strip-types --test --test-timeout 60000 '**/*.test.ts' && cd ..
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader

# Spin up the eval dashboard
node --experimental-strip-types bin/ggdd-dev.ts dashboard
\`\`\`

See [CONTEXT.md](./CONTEXT.md) for repo orientation. See [docs/superpowers/specs/2026-05-27-ggdd-design.md](./docs/superpowers/specs/2026-05-27-ggdd-design.md) for the v1 design.
```

- [ ] **Step 3: Commit**

```bash
git add README.md serving/README.md
git commit -m "docs: README updates for v1 release — npm install flow + dev quickstart"
```

---

## Task 7: CONTEXT.md final pass + tag v1.0.0

- [ ] **Step 1: Update `CONTEXT.md`**

Clean up the "Active TODOs" section — many items are now resolved or moved into release notes. Final state:

```markdown
## Active TODOs

- **Real Unity-batch grader integration**: `guides/test-fixture.ts` exposes `unityCompile` / `unityRunEditModeTests` (via `harness/lib/unity-runner.ts`) but no grader actually calls them yet. The `gc-free-update-loop` guide is marked `gradeMode: static+unity` so the first guide to wire it up is unambiguous. Land when there's a meaningful behavioral check that static analysis can't cover.
- **Brawler / deckbuilder skeleton base-apps**: `harness/base_apps/{brawler,deckbuilder}-skeleton/` are README placeholders. Build out as real Unity projects when their guides need genre-specific scene/script context.
- **Stub agent runners**: codex-cli, gemini-cli, jetski-cli throw `NotImplementedError`. Wire up when needed (claude-code is real and primary).
- **pnpm install OOMs on this dep tree** — use npm. See `project_ggdd_pnpm_oom` memory.
- **`ANTHROPIC_API_KEY`** required for `ggdd-dev gen-grader` / `gen-negative` at runtime; tests use dry-run mode and consume no quota.
- **`GGDD_GCS_BUCKET`** optional — without it `ggdd-dev upload` is a no-op. Set to enable GCS upload (currently a placeholder; wire the actual upload when the dashboard moves to remote artifacts).
- **GitHub Pages enable step**: `ggdd-dev deploy` pushes to the `gh-pages` branch; you must enable Pages source = `gh-pages` in the repo settings the first time.
- **npm publish**: not automated. Run `cd serving && npm publish --access public` when ready. Requires npm credentials.
```

Replace the existing "Active TODOs" block entirely with the above. Keep the rest of CONTEXT.md unchanged.

- [ ] **Step 2: Final full preflight**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts' 2>&1 | tail -3
cd serving && node --experimental-strip-types --test --test-timeout 60000 'lib/**/*.test.ts' 'bin/**/*.test.ts' 'mcp-server/**/*.test.ts' 'scripts/**/*.test.ts' 'skills-cli/**/*.test.ts' 2>&1 | tail -3
cd ../harness && node --experimental-strip-types --test --test-timeout 60000 'config.test.ts' 'lib/*.test.ts' 'agents/*.test.ts' 2>&1 | tail -3
cd ../eval-view && npm test 2>&1 | tail -5
cd .. && node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
cd serving && node --experimental-strip-types skills-cli/build-dist.ts
node build/ggdd.js --version
node build/ggdd.js search "input" | head -c 60
echo
cd ..
```

Expected: all green; build verifies; the bundled CLI runs with plain `node` (no `--experimental-strip-types` flag needed in production).

- [ ] **Step 3: Commit + tag v1.0.0**

```bash
git add CONTEXT.md
git commit -m "docs: final CONTEXT.md cleanup for v1.0.0 release"
git tag v1.0.0
git log --oneline | head -15
```

---

## Plan 6 acceptance checks

- [ ] `serving/skills-cli/telemetry/` no longer exists
- [ ] `serving/package.json` `bin: build/ggdd.js`, `engines: { node: ">=22" }`, `prepublishOnly` set
- [ ] `serving/skills-cli/build-dist.ts` produces self-contained `serving/build/` with model + corpus + SKILL.md
- [ ] `node serving/build/ggdd.js --version` works (no `--experimental-strip-types` needed)
- [ ] `node serving/build/ggdd.js search "input"` returns ranked JSON
- [ ] `harness/run_suite.ts` populates `perAssertion`
- [ ] SKILL.md, plugin.json, skill-version.txt all at v1 (2026_05_28_v1 / 1.0.0)
- [ ] Tag `v1.0.0`

---

## What the user does next (manual, not automated by Plan 6)

1. **Publish to npm:**

   ```shell
   cd serving
   npm login    # one-time
   npm publish --access public
   ```

2. **Register the Claude Code plugin**: the marketplace pattern is `/plugin marketplace add jli996/ggdd`. Once the repo is public + has a tagged release, Claude Code users can install via:

   ```shell
   /plugin install ggdd@jli996
   ```

3. **Enable GitHub Pages** for the `gh-pages` branch (Settings → Pages → Source = `gh-pages` branch) so `ggdd-dev deploy` lands at `https://jli996.github.io/ggdd/`.

4. **Optional**: register on Vercel Skills CLI, GitHub Copilot marketplace, Google Antigravity. Each is a manifest entry pointing at the published npm package — additive.

---

## Out of scope

- **Actual npm publish** — needs credentials.
- **Vercel / Copilot / Antigravity channel registrations** — additive, can land any time post-launch.
- **Telemetry** — stripped per CONTEXT.md TODO option (b).
- **Real GCS upload** — `upload_suite.ts` remains a stub.

## Self-review

- **Spec coverage:** Plan 6 closes the distribution loop from design §8.1. The pre-launch tracked TODOs from Plans 1–5 are addressed: telemetry stripped (1), bin path swapped + engines added (1), per-assertion populated (5), README install instructions documented (1+6).
- **No placeholders:** every step has real commands/code. The "user does next" section is intentionally documentation, not an automated step — credentials are required.
- **Type consistency:** new `PerAssertion` type added to `guides/run-grader.ts`'s `GraderResult` AND threaded through `harness/run_suite.ts`'s `RunResult.grader.perAssertion`. `eval-view/src/lib/dataLoader.ts`'s `RunResult` type already declares the same shape, so the dashboard's drilldown will now render real data.
