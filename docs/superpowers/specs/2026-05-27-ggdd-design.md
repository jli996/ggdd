# ggdd — Game Guidance for Development Done-right

**Status:** Approved design — implementation plan pending
**Date:** 2026-05-27
**Reference project:** `/Users/lijinglue/repo/modern-web-guidance-src` (MWG)

---

## 1. Overview

**ggdd** is a CLI + agent skill that gives coding agents curated, token-efficient guidance for Unity 6 game development. It mirrors `modern-web-guidance-src`'s shape end-to-end: a runtime CLI for agents (`ggdd search|list|retrieve|install`), a guide content tree, a local semantic-search embedder, an authoring/evaluation harness, a dashboard, a per-guide grader pipeline, and multi-channel skill distribution.

### 1.1 v1 Goals

1. **Runtime usable by Claude Code today** — `ggdd` ships via npm + Claude Code plugin; agent can search and retrieve guides.
2. **Four content tracks seeded** — `unity-engine`, `unity-performance`, `game-design-action`, `game-design-deckbuilder`. Initial bar: ~3 guides per track (12 total) with full per-guide artifacts.
3. **Full authoring pipeline operational** — `ggdd-dev dev <guide-dir>` runs generate-negative → generate-grader → calibrate → guided agent test.
4. **Full evaluation harness operational** — `ggdd-dev eval` runs configured agents (Claude Code, Codex, Gemini CLI) against committed Unity base-apps using the guidance, scores them, writes metrics to a dashboard.
5. **MCP server** for agents that prefer MCP over CLI invocation.
6. **Graders may invoke Unity batch mode** (compile + Edit Mode / Play Mode tests) in addition to static C# analysis.

### 1.2 Non-goals (v1)

- Unity versions other than 6 LTS. 2022 / 2021 LTS divergence is not tracked.
- Distribution channels beyond npm + Claude Code (Copilot, Vercel skills, Antigravity manifests come later).
- A working `apiref` command (Unity API/version compat lookups). The command exists as a no-op placeholder.
- Replacing or competing with the existing `unity-mcp-skill` — ggdd is **read-only guidance**, the two are complementary.

### 1.3 Cross-cutting principle

Guides are token-lean. The eval pipeline measures whether each guide improves agent outcomes vs. running without it; any guide that doesn't earn its tokens is pruned. Same calibration discipline as MWG.

---

## 2. Repository layout

Two pnpm-workspace packages live in the repo:
- **Root** (`/`) — private dev tooling, exposes `ggdd-dev` bin. Never published.
- **`serving/`** — published npm package, exposes `ggdd` bin. Zero network calls, zero API keys, runs offline.

```
/Users/lijinglue/repo/ggdd/
├── bin/
│   └── ggdd-dev.ts              # dev/authoring CLI (mirrors bin/gd.ts)
├── serving/                     # PUBLISHED npm package
│   ├── bin/
│   │   └── ggdd.ts              # user-facing CLI (mirrors serving/bin/modern-web.ts)
│   ├── cli/
│   │   └── apiref.ts            # placeholder (mirrors baseline-status.ts)
│   ├── lib/
│   │   ├── search.ts
│   │   ├── retrieve.ts
│   │   ├── tfjs-embedder.ts     # TF.js MiniLM (same model as MWG)
│   │   ├── transformers-embedder.ts
│   │   ├── practices.ts
│   │   ├── macros.ts
│   │   ├── include.ts
│   │   ├── version.ts
│   │   └── tfjs_model_minilm/   # vendored model weights
│   ├── mcp-server/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   └── tools/               # ggdd_search, ggdd_retrieve
│   ├── megaskill/
│   │   └── megaskill.md
│   ├── skills-cli/
│   │   ├── build-dist.ts
│   │   ├── publish-skills.ts
│   │   ├── template/            # SKILL.md + plugin.json template
│   │   └── telemetry/           # ClearcutLogger code, sink stubbed to no-op
│   ├── scripts/
│   │   ├── build-guides.ts      # emit use-cases.gen.ts + embeddings.gen.bin
│   │   └── build-megaskill.ts
│   └── package.json
├── guides/                       # all guide content + author-time tooling
│   ├── unity-engine/
│   ├── unity-performance/
│   ├── game-design-action/
│   ├── game-design-deckbuilder/
│   ├── AGENTS.md
│   ├── dev-guide.ts             # per-guide authoring pipeline
│   ├── grader-gen.ts            # LLM-driven grader scaffolding
│   ├── negative-gen.ts          # LLM-driven negative-demo scaffolding
│   ├── test-grader.ts           # validate grader against demo + negative-demo
│   ├── run-grader.ts            # run a grader once
│   ├── template.grader.ts
│   ├── test-fixture.ts          # shared static + Unity grader helpers
│   ├── sync-use-cases.ts        # write features/*.md → use-case index
│   ├── feedback-handler.ts
│   ├── ci-pipeline.ts
│   └── package.json
├── features/                     # cross-cutting capability pages (URP, hit-stop, etc.)
├── harness/
│   ├── base_apps/
│   │   ├── empty-unity6/
│   │   ├── brawler-skeleton/
│   │   ├── deckbuilder-skeleton/
│   │   └── negative/
│   ├── agents/
│   │   ├── claude-code-agent.ts
│   │   ├── codex-cli-agent.ts
│   │   ├── gemini-cli-agent.ts
│   │   └── jetski-cli-agent.ts
│   ├── lib/
│   │   ├── agent-shared.ts
│   │   ├── collection.ts
│   │   ├── metrics.ts
│   │   ├── reporting.ts
│   │   └── unity-runner.ts      # Unity batch-mode wrapper
│   ├── tests/
│   ├── config.ts                # Serving target, agent list, concurrency, unityEditorPath
│   ├── run_suite.ts
│   ├── evaluate.ts
│   ├── backfill.ts
│   ├── upload_suite.ts
│   ├── quick-smoke.ts
│   └── package.json
├── eval-view/                    # dashboard (React/Vite, mirrors MWG)
├── lib/
│   ├── colors.ts
│   ├── paths.ts
│   ├── guide-validation.ts
│   └── skills-config.ts
├── skills-src/                   # additional standalone skills (mirrors MWG)
├── nightly/
├── .agents/
├── .github/
├── package.json                  # pnpm workspace root, exposes ggdd-dev bin
├── pnpm-workspace.yaml
├── tsconfig.json
├── config.ts.example
├── constants.ts
├── CONTEXT.md
├── CONTRIBUTING.md
├── EVALS.md
├── README.md
└── LICENSE                       # Apache-2.0
```

### 2.1 Boundaries

- `serving/` is the only thing end users see. Source of truth for the published npm package.
- `guides/` is content + author-time tooling. The `dev-guide.ts` pipeline calls Anthropic via `.env`; this code never ships.
- `harness/` runs agents against base-apps. Pulls guide content via `serving/`, simulating real use.
- `bin/ggdd-dev.ts` is the dev entry point; routes to `guides/*` and `harness/*` subcommands.
- `eval-view/` is a static SPA built and deployed to GitHub Pages.

### 2.2 Unity-specific divergences from MWG

- **No Playwright.** Graders use `node:test`. Per-guide grader files are Node tests, not Playwright tests.
- **Base apps are real Unity 6 projects.** Committed to git with `.gitignore` (Library/, Temp/, Logs/, Obj/, Build/, UserSettings/, *.csproj, *.sln) and `.gitattributes` LFS tracking for binary assets. Each base-app's `library-cache/` is gitignored and populated via `ggdd-dev warm-cache <app>`.

---

## 3. Runtime CLI (`ggdd`)

Lives in `serving/bin/ggdd.ts`. Published to npm as `ggdd`. Zero network calls, zero API keys, runs offline. Invoked as `npx ggdd@latest <cmd>`.

### 3.1 Commands

| Command | Purpose | Output |
|---|---|---|
| `ggdd search "<query>"` | Local semantic search over use cases. Returns top-N matches with `id`, `category`, `description`, `similarity`. | Compact JSON array. |
| `ggdd list` | Dump full catalog of use cases. | Pretty-printed JSON array. |
| `ggdd retrieve <id>[,<id>...]` | Fetch one or more guides by id. | Markdown, prefixed per-guide with `--- Guide for <id> ---`. |
| `ggdd install` | Install via `npx skills add owner/ggdd`. `--choose` for interactive skill selection. | — |
| `ggdd uninstall` | Remove ggdd skills. | — |
| `ggdd update` | Update installed ggdd skills. | — |
| `ggdd -v` / `--version` | Print version. | — |
| `ggdd -h` / `--help` | Print usage. | — |

### 3.2 Flags

- `--skill-version <v>` — internal; the SKILL.md sets this so the CLI warns when the caller's version is stale (>5 days warn, >60 days escalated message). Same logic as MWG.

### 3.3 Search index build

- `serving/scripts/build-guides.ts` walks `guides/**/guide.md`, parses frontmatter, generates:
  - `serving/lib/use-cases.gen.ts` — flat array of `{id, category, description, embeddingVectorIndex}`.
  - `serving/lib/embeddings.gen.bin` — binary blob of pre-computed embedding vectors (one per use case, MiniLM model).
- At query time, the CLI embeds the user query with the same model (TF.js CPU backend) and computes cosine similarity against the pre-computed vectors. No model inference for the corpus.

### 3.4 MCP server

- Stdio MCP server at `serving/mcp-server/`. Exposes `ggdd_search` and `ggdd_retrieve` tools (same semantics as the CLI commands).
- Built with `@modelcontextprotocol/sdk`. Agents can attach this directly via their MCP config.

### 3.5 Telemetry

- `ClearcutLogger` from MWG is ported in full (`serving/skills-cli/telemetry/`) but the **sink is stubbed to a no-op by default**. No telemetry is emitted unless an explicit opt-in endpoint is configured via `GGDD_TELEMETRY_ENDPOINT`.
- MWG ships pointed at a Google endpoint — this codebase does not inherit that endpoint, only the code shape.
- **TODO (tracked in §8.3)**: decide before public launch whether to fully wire to an opt-in endpoint or strip the code entirely.

### 3.6 Megaskill

- `serving/megaskill/megaskill.md` — pre-bundled "everything at once" skill variant for agents that prefer to load guidance upfront vs. search-on-demand.

---

## 4. Content model

### 4.1 Per-guide directory layout

```
guides/<category>/<guide-id>/
├── guide.md              # the guidance content — what agents retrieve
├── expectations.md       # behavioral spec — what the agent should produce
├── demo/                 # reference correct implementation
│   ├── Demo.cs
│   └── ...
├── negative-demo/        # reference legacy/wrong implementation
│   ├── NegativeDemo.cs
│   └── ...
├── editor-tests/         # OPTIONAL: Unity Edit Mode tests (runtime grader checks)
│   ├── GuideTests.cs
│   └── GuideTests.asmdef
├── grader.ts             # node:test runner — static checks + optional Unity batch
└── tasks/
    └── task.md           # task prompt given to the agent
```

### 4.2 `guide.md` frontmatter

```yaml
---
id: gc-free-update-loop
category: unity-performance
title: GC-free Update() loops
description: Prevents per-frame heap allocations that thrash the GC and cause frame hitches.
useCases:
  - "avoid GC spikes in Update"
  - "fix frame stutters from allocations"
  - "remove LINQ from hot paths"
relatedGuides:
  - object-pooling-basics
appliesTo:
  - "MonoBehaviour scripts in hot paths"
baseApp: empty-unity6
gradeMode: static          # "static" | "unity" | "static+unity"
unityVersion: "6000.0"
---
```

`description` + `useCases` feed the embedder. `gradeMode` tells the harness whether to invoke Unity. `baseApp` ties the guide to one of the committed Unity projects under `harness/base_apps/`.

### 4.3 Top-level taxonomy

Four categories, 3 seeded guides each (12 total for v1):

| Category | Seeded guides (v1) |
|---|---|
| `unity-engine/` | `new-input-system-basics`, `addressables-load-async`, `scriptableobject-shared-state` |
| `unity-performance/` | `gc-free-update-loop`, `object-pooling-basics`, `urp-srp-batcher-friendly-materials` |
| `game-design-action/` | `hit-stop-on-impact`, `input-buffering`, `knockback-with-control-takeback` |
| `game-design-deckbuilder/` | `run-pacing-3-act-structure`, `card-rarity-without-power-creep`, `relic-stacking-readability` |

### 4.4 Features directory

`features/` holds shared, cross-cutting capability pages — `features/urp.md`, `features/input-system.md`, `features/hit-stop.md`, `features/profiler.md`. No graders; guides `!include` from them to stay DRY.

### 4.5 Use-case index

`guides/sync-use-cases.ts` walks every `guide.md`, collects all `useCases` entries, writes:
- `serving/lib/use-cases.gen.ts` — source of truth for `ggdd list` and the search corpus.
- `serving/lib/embeddings.gen.bin` — vectors pre-computed at build time.

One use-case maps to one guide id.

### 4.6 Cross-domain references

Game-design guides may reference Unity-engine guides via `relatedGuides`. The dashboard surfaces these links; the runtime CLI doesn't auto-follow — the agent decides what to pull next.

### 4.7 Token budgets

Each `guide.md` aims for ≤ 800 tokens body, ≤ 200 tokens frontmatter (soft targets). Eval pipeline drives pruning of content models already know.

---

## 5. Grader pipeline & Unity batch-mode integration

### 5.1 Runtime

`node:test` (built-in), invoked as `node --experimental-strip-types --test grader.ts`. No Playwright.

### 5.2 Grader environment

Set by the harness before invoking the grader:

- `TARGET_PROJECT` — absolute path to the agent's modified copy of the base-app Unity project.
- `TARGET_FILES` — JSON array of file paths the agent was asked to edit (relative to `TARGET_PROJECT`).
- `GRADE_MODE` — copied from the guide's `gradeMode` frontmatter.
- `UNITY_EDITOR_PATH` — resolved Unity 6 Editor binary path.
- `LIBRARY_CACHE_DIR` — shared, pre-warmed `Library/` cache to symlink in.

### 5.3 Shared grader helpers (`guides/test-fixture.ts`)

```ts
// Static analysis (no Unity needed)
readCSharp(relPath: string): string
usesNamespace(src: string, ns: string): boolean
hasPattern(src: string, pattern: RegExp): boolean
hasNoPattern(src: string, pattern: RegExp): boolean
declaresType(src: string, kind: 'class'|'struct'|'enum', name: string): boolean
methodCallsAst(src: string, methodName: string): { count: number; sites: AstSite[] }
   // Tree-sitter C# AST; falls back to regex if tree-sitter fails to load
serializedAssetField(unityAssetPath: string, fieldPath: string): unknown
   // Parses Unity YAML for asset inspection (prefabs, ScriptableObjects)

// Unity batch mode (only when gradeMode includes "unity")
unityCompile(): Promise<{ ok: boolean; errors: CompileError[] }>
unityRunEditModeTests(asmdef: string): Promise<NUnitResult[]>
unityRunPlayModeTests(asmdef: string): Promise<NUnitResult[]>
unityRunStaticMethod(qualifiedMethod: string): Promise<{ exitCode: number; jsonOut: unknown }>
```

Each `unity*` call is a separate batch invocation. Helpers throttle internally so concurrent grader runs against the same `Library/` cache serialize.

### 5.4 Example grader (`guides/unity-performance/gc-free-update-loop/grader.ts`)

```ts
import { test } from 'node:test';
import assert from 'node:assert';
import { readCSharp, hasNoPattern, methodCallsAst, unityCompile, unityRunEditModeTests }
  from '../../../guides/test-fixture.ts';

const playerSrc = readCSharp('Assets/Scripts/Player.cs');

test('no LINQ on the hot path', () => {
  assert.ok(hasNoPattern(playerSrc, /\busing\s+System\.Linq\b/));
});

test('no per-frame allocations of common types', () => {
  const updateBody = methodCallsAst(playerSrc, 'Update').sites[0]?.body ?? '';
  assert.ok(!/\bnew\s+List<|\bnew\s+Dictionary<|\bnew\s+\w+\[/.test(updateBody));
});

test('Unity compiles the modified project', async () => {
  const { ok, errors } = await unityCompile();
  assert.ok(ok, `Compile errors:\n${errors.map(e => e.message).join('\n')}`);
});

test('Edit Mode tests pass (no allocations measured)', async () => {
  const results = await unityRunEditModeTests('editor-tests/GuideTests.asmdef');
  const failed = results.filter(r => r.outcome !== 'Passed');
  assert.equal(failed.length, 0, failed.map(r => `${r.name}: ${r.message}`).join('\n'));
});
```

### 5.5 Unity batch invocation (`harness/lib/unity-runner.ts`)

- **Editor resolution order:** `UNITY_EDITOR_PATH` env > `config.ts` value > autodetect under `~/Applications/Unity/Hub/Editor/6000.*/` (macOS), `C:\Program Files\Unity\Hub\Editor\6000.*\` (Win), `~/Unity/Hub/Editor/6000.*/` (Linux). Hard-fail with a clear "install Unity 6 LTS or set UNITY_EDITOR_PATH" message.
- **Test runs:** `Unity -batchmode -nographics -projectPath <p> -runTests -testPlatform <EditMode|PlayMode> -testResults <xml> -logFile <log> -quit -assemblyNames <asmdef-name>`. Parse NUnit3 XML.
- **Compile-only runs:** `-executeMethod GgddBuildBridge.CompileOnly`, invoking a small `Editor/GgddBuildBridge.cs` injected into every base-app under `Assets/Editor/Ggdd/`. Writes JSON compile result to a known path.
- **Static-method runs:** `-executeMethod <FQN>` for guides invoking an Editor utility directly.
- **Library cache:** harness creates a unique work copy of the base-app, symlinks `Library/` to a shared pre-warmed cache. Not deleted after grader exit — re-use speeds subsequent runs. CI cold path ~90s; warm path ~5s for compile-only.
- **Process supervision:** hard wallclock timeout (default 5 min per Unity invocation), SIGTERM → SIGKILL escalation, stdout/stderr/log captured into the run's eval artifacts directory.

### 5.6 Concurrency

Unity Hub allows one Editor process per project path; multiple projects can run in parallel. The harness pools up to `M=2` (configurable, see §6.7) concurrent base-app copies, each with its own pre-warmed Library cache. Graders within the same pool slot serialize.

### 5.7 `gradeMode` dispatch

- `static` — grader runs `node:test`, never touches Unity. Fastest.
- `unity` — every test calls a `unity*` helper. Slowest.
- `static+unity` — mixed. Default for most performance/engine guides — cheap static checks first, Unity behavioral checks after.

### 5.8 Negative-demo calibration

Every grader runs against both `demo/` (must pass) and `negative-demo/` (must fail) during `ggdd-dev dev <guide-dir> --test-grader`. A grader that passes its own negative demo is broken and CI fails it.

### 5.9 Tree-sitter dependency

`tree-sitter` + `tree-sitter-c-sharp` are added to the `guides/` workspace package only (not `serving/`, keeping the runtime CLI tiny). Required for `methodCallsAst` and AST-level checks. Failure to load tree-sitter falls back to regex with a warning.

---

## 6. Harness (base apps, agent runners, eval suite, dashboard)

### 6.1 Top-level flow (one eval task)

1. Pick a guide from the suite.
2. Copy its `baseApp` (Unity project under `harness/base_apps/`) to a temp directory.
3. Symlink the base-app's pre-warmed `Library/` cache into the copy.
4. Construct the agent prompt from `tasks/task.md` + the list of `TARGET_FILES` the agent may edit.
5. Spawn the agent (claude-code / codex / gemini / jetski-cli) with the `ggdd` skill installed (CLI or MCP) and the copy as the working directory.
6. Wait for agent completion (hard timeout, default 10 min).
7. Run the guide's `grader.ts` against the copy. Record pass/fail per assertion.
8. Write a results artifact: `{ taskId, agent, modelVersion, grader: {tests, summary}, trajectory, timings, costs }`.
9. Optionally tear down or preserve the copy for dashboard inspection.

### 6.2 Base apps

| Base app | Purpose | Approx. size on disk (excl. Library) |
|---|---|---|
| `empty-unity6/` | Plain URP project, no gameplay. Default for engine/perf guides. | ~5–15 MB |
| `brawler-skeleton/` | 2D scene, one player, one enemy, basic combat skeleton. Used by action-design guides. | ~10–30 MB |
| `deckbuilder-skeleton/` | Minimal scene with a `Card` ScriptableObject, deck container, draw UI. Used by deckbuilder-design guides. | ~10–25 MB |
| `negative/` | Empty C# project (not Unity) used to verify graders fail when the codebase is wrong by construction. | ~1 MB |

### 6.3 Base-app file layout

```
harness/base_apps/<app>/
├── .gitattributes          # Unity LFS pattern set (see §6.5)
├── .gitignore              # Unity standard ignore set (see §6.4)
├── Assets/
├── Packages/manifest.json  # pinned Unity 6 + URP + Input System + Test Framework
├── ProjectSettings/
├── library-cache/          # gitignored — populated by `ggdd-dev warm-cache <app>`
└── README.md
```

### 6.4 `.gitignore` set (Unity standard)

```
Library/
Temp/
Logs/
Obj/
obj/
Build/
Builds/
UserSettings/
MemoryCaptures/
*.csproj
*.sln
*.suo
*.user
*.unityproj
.DS_Store
library-cache/
```

### 6.5 `.gitattributes` set (LFS tracking + text-mode for Unity YAML)

```
# LFS — binary assets
*.psd          filter=lfs diff=lfs merge=lfs -text
*.png          filter=lfs diff=lfs merge=lfs -text
*.jpg          filter=lfs diff=lfs merge=lfs -text
*.jpeg         filter=lfs diff=lfs merge=lfs -text
*.tga          filter=lfs diff=lfs merge=lfs -text
*.exr          filter=lfs diff=lfs merge=lfs -text
*.fbx          filter=lfs diff=lfs merge=lfs -text
*.obj          filter=lfs diff=lfs merge=lfs -text
*.blend        filter=lfs diff=lfs merge=lfs -text
*.wav          filter=lfs diff=lfs merge=lfs -text
*.mp3          filter=lfs diff=lfs merge=lfs -text
*.ogg          filter=lfs diff=lfs merge=lfs -text
*.aif          filter=lfs diff=lfs merge=lfs -text
*.anim         filter=lfs diff=lfs merge=lfs -text
*.controller   filter=lfs diff=lfs merge=lfs -text
*.bytes        filter=lfs diff=lfs merge=lfs -text
*.dll          filter=lfs diff=lfs merge=lfs -text
*.so           filter=lfs diff=lfs merge=lfs -text
*.dylib        filter=lfs diff=lfs merge=lfs -text

# Force text/UTF-8 for Unity YAML (readable diffs)
*.unity        text eol=lf
*.prefab       text eol=lf
*.asset        text eol=lf
*.mat          text eol=lf
*.meta         text eol=lf
```

### 6.6 Agent runners (`harness/agents/`)

One runner per backend, implementing a common interface:

```ts
interface AgentRunner {
  id: string;                    // "claude-code" | "codex-cli" | "gemini-cli" | "jetski-cli"
  defaultModel: string;
  prepareSkill(workdir: string, serving: Serving): Promise<void>;
  run(opts: {
    workdir: string;
    prompt: string;
    targetFiles: string[];
    timeoutMs: number;
  }): Promise<AgentRunResult>;
}
```

`prepareSkill` installs the ggdd skill into the agent's expected location (Claude Code plugins dir, Gemini extensions dir, etc.) or sets up MCP stdio config, depending on the `Serving` mode the suite was launched with.

### 6.7 Suite config (`harness/config.ts`)

Mirrors MWG's `resolveSuiteConfig`. Exposes:
- `Serving = CLI | MCP | SKILLS_CLI`
- agent list + model selection
- concurrency cap (default `N=4` overall, `M=2` Unity-batch sub-pool)
- output directory
- optional `unityEditorPath`, optional `libraryCacheRoot`

### 6.8 Run orchestration (`harness/run_suite.ts`)

For each `(agent, guide)` pair, runs the flow in §6.1. Writes results to `harness/runs/<timestamp>/<agent>-<guide>.json`. Supports `--filter <category>` and `--tasks <id,id>`.

### 6.9 Metrics (`harness/lib/metrics.ts`)

Per run: pass rate, per-assertion outcome, time-to-first-edit, total agent latency, agent cost (when reported), Unity batch time, total wall time. Aggregated by guide, by category, by agent, by model.

### 6.10 Dashboard (`eval-view/`)

React/Vite SPA, identical shape to MWG's `eval-view/`. Reads result JSONs from disk (local dev) or from a GCS bucket (after `ggdd-dev upload`). Shows:

- Per-guide grader pass rate over time
- Per-agent/model comparison
- Drilldown into a single run: task prompt, agent trajectory, modified files diffed against base-app, grader test results, Unity batch log
- Guides flagged as "models already know this" (high pass rate with skill disabled) — candidates for pruning

Deployed to GitHub Pages via `ggdd-dev deploy`. GCS upload via `ggdd-dev upload` (signed-URL upload, bucket configured via `.env`).

### 6.11 Pre-warm command

`ggdd-dev warm-cache <baseApp>` opens Unity batch mode once on a base-app to populate `library-cache/`. Documented as a one-time setup step in `CONTRIBUTING.md`. CI uses the `game-ci/unity-test-runner` action which carries its own license + cached Library.

---

## 7. Authoring tooling (`ggdd-dev`)

Root-package CLI. Lives in `bin/ggdd-dev.ts`. Exposed via the root `package.json`'s `bin` field. Never published to npm.

### 7.1 Command set

| Command | Purpose | Key flags |
|---|---|---|
| `ggdd-dev audit` | Show status of every guide. | `--usecases` to group by use case |
| `ggdd-dev dev <guide-dir>` | Author/calibrate pipeline (default = full loop). | `--grade`, `--test-grader`, `--gen-grader`, `--gen-negative`, `--guided`, `--no-test`, `--cross-app`, `--verbose` |
| `ggdd-dev dev-all` | Run `dev` across every guide. Undocumented in help. | `--verbose` |
| `ggdd-dev eval [suite\|tasks...]` | Run the full eval suite or specific tasks/categories. | `--config <path>`, `--ui` |
| `ggdd-dev dashboard` | Start `eval-view/` locally. | — |
| `ggdd-dev run <template> <prompt>` | Ad-hoc agent run against a base-app. | `--config <path>` |
| `ggdd-dev deploy` | Publish `eval-view/` build to GitHub Pages. | — |
| `ggdd-dev upload` | Upload latest results to GCS. | — |
| `ggdd-dev backfill` | Recompute metrics for historical run artifacts. | — |
| `ggdd-dev warm-cache <baseApp>` | Pre-populate `harness/base_apps/<app>/library-cache/`. | — |
| `ggdd-dev apiref <query>` | Placeholder. v1: prints "Unity 6 only" and exits 0. | — |
| `ggdd-dev setup-completion` | Install zsh/bash completions via `omelette`. | — |

Global flags: `-h` / `--help`, `-v` / `--version`, `--verbose`.

### 7.2 `ggdd-dev dev <guide-dir>` pipeline

```
1. Validate guide directory (has guide.md with required frontmatter).
2. If --gen-negative: call Anthropic to generate negative-demo/ from guide.md + demo/. Stop.
3. If --gen-grader: call Anthropic to generate grader.ts from guide.md + expectations.md + demo/. Stop.
4. If --test-grader: run grader on demo/ (expect pass), run grader on negative-demo/ (expect at least one fail). Exit 0/1.
5. If --grade: run grader on demo/, print results. Stop.
6. Default loop:
   a. Ensure negative-demo exists (auto-gen if missing, with confirmation).
   b. Ensure grader exists (auto-gen if missing, with confirmation).
   c. --test-grader (must calibrate).
   d. Unless --no-test: run a guided agent test (single agent, single guide) and report grader outcome.
   e. If --cross-app: also run the grader against an unmodified base-app, expect failure.
7. Print summary table.
```

### 7.3 LLM-driven generators

`guides/grader-gen.ts`, `guides/negative-gen.ts`: use the Anthropic SDK with prompt caching. Read `.env` for `ANTHROPIC_API_KEY` (and optionally `GEMINI_API_KEY` for cross-checks). Output is human-reviewed before commit — generators scaffold, the author refines. Same pattern as MWG.

### 7.4 Shell completion

`omelette`: completes commands, then context-sensitive args — `dev` completes guide directories; `eval` completes guide ids + `suite` + flags. Identical wiring to MWG's `gd`.

### 7.5 Argument routing

Single dispatch file using `node:util` `parseArgs`. Same metadata-driven help printer and compile-time `AssertEmpty` checks MWG uses to ensure every command and flag is documented in `--help`.

### 7.6 Workspace scripts

Root `package.json` convenience aliases: `pnpm test`, `pnpm preflight` (`build && typecheck && lint && test`), `pnpm dashboard`, `pnpm build:mcp`. Mirrors MWG's script layout.

---

## 8. Distribution, testing, follow-ups

### 8.1 Distribution

**npm package (`ggdd`):**
- Published from `serving/`. Includes: `bin/ggdd.ts`, `cli/`, `lib/` (vendored MiniLM model + pre-built embeddings + `use-cases.gen.ts`), `mcp-server/`, `megaskill/megaskill.md`, `skills-cli/template/`, `skill-version.txt`.
- Excludes: telemetry endpoint config, eval result fixtures, anything under `harness/` or `guides/` source.
- `package.json` has `"bin": { "ggdd": "bin/ggdd.ts" }` with `#!/usr/bin/env -S node --experimental-strip-types` shebang. Supports `npx ggdd@latest <cmd>`.
- Build chain: `serving/scripts/build-guides.ts` writes `use-cases.gen.ts` + `embeddings.gen.bin`; `serving/skills-cli/build-dist.ts` esbuild-bundles the CLI for npm publish.
- `prepublishOnly` runs build; release flow is `pnpm --filter serving build && pnpm --filter serving publish`.

**Claude Code plugin:**
- `serving/skills-cli/template/` contains the SKILL.md template, plugin manifest (`plugin.json`), and the bundled `serving/build/` CLI.
- Users install via `/plugin marketplace add <owner>/ggdd` → `/plugin install ggdd@<owner>`. The plugin manifest points the agent's tool-use to `npx ggdd@latest search|retrieve`.
- Skill versioning: `skill-version.txt` regenerated on every SKILL.md change. Runtime CLI reads it and prints an upgrade warning when the caller's version is >5 days old, escalates after 60 days.

**Deferred channels (post-v1):** Vercel Skills CLI, GitHub Copilot marketplace, Google Antigravity — additive manifests pointing at the same npm package.

### 8.2 Testing strategy

Three layers:

1. **Unit tests** (`*.test.ts` co-located with source) — run via `node --test --experimental-strip-types`. Cover search ranking, retrieve path resolution, frontmatter parsing, use-case build, embedder determinism, MCP tool registration, telemetry no-op sink, dev CLI argument parsing, harness collection logic, metrics computation, NUnit XML parsing.

2. **Per-guide grader self-tests** — `ggdd-dev dev <guide> --test-grader` runs the grader against `demo/` (expect pass) and `negative-demo/` (expect fail). CI runs `ggdd-dev dev-all --test-grader` to catch graders that drift out of calibration.

3. **End-to-end eval** — `ggdd-dev eval` against real agents. Runs nightly in CI (separate workflow, separate cost budget) using `game-ci/unity-test-runner` for Unity-backed graders. Results upload to GCS, dashboard refreshes.

**CI matrix:**
- PR CI (`pnpm preflight`): build + typecheck + lint + unit tests + `dev-all --test-grader` on the **static-only** subset of graders (no Unity license needed).
- Nightly CI: full eval suite — needs `UNITY_LICENSE`, `ANTHROPIC_API_KEY`, agent API keys as repo secrets.

### 8.3 Risks and follow-up TODOs

Tracked in `CONTEXT.md` once implementation begins:

1. **Telemetry sink** — code is present from MWG port; sink stubbed to no-op. **Before public launch:** decide whether to (a) wire to an opt-in endpoint, or (b) strip the ClearcutLogger code entirely. Currently leaning (b) for simplicity.
2. **Unity license cost & CI flakiness** — `game-ci/unity-test-runner` is reliable but Unity batch mode can occasionally hang. Watchdog timeouts mitigate; investigate flake rate after first month of nightly runs.
3. **Library cache size growth** — pre-warmed caches per base-app are 1–3 GB each. Local dev needs ~10 GB free. Document in `CONTRIBUTING.md`.
4. **Tree-sitter C# bundling** — `tree-sitter-c-sharp` is native; cross-platform CI may need per-platform binaries. Falls back to regex if missing.
5. **Game-design grader rigor** — design-pattern checks ("did the agent implement hit-stop?") are inherently fuzzier than perf checks ("no allocations in Update"). Initial graders will under-detect; iterate based on real eval data.
6. **Genre coverage breadth** — v1 ships 2 of N game-design genres. Roadmap: shooter, platformer, survival, simulation, citybuilder. Each is an isolated content addition; the harness/base-app pattern generalizes.
7. **`apiref` placeholder** — when Unity 6.x acquires meaningful sub-version differences, replace the placeholder with real lookups against a curated JSON of Unity feature additions.
8. **Repo init / git LFS setup** — implementation step 0: `git init` (done), `git lfs install`, commit `.gitignore` and `.gitattributes` before adding any base-app binaries.

### 8.4 Open questions

None blocking. Anything that surfaces during implementation lands in `CONTEXT.md` as a follow-up.
