# ggdd repository orientation

## Top-level layout

- `serving/` — npm-publishable package (`name: ggdd`). Runtime CLI + MCP server + vendored MiniLM. Zero network calls, zero API keys, runs offline. Source of truth for what end users get.
- `guides/` — guide content. 12 guides seeded across `unity-engine`, `unity-performance`, `game-design-action`, `game-design-deckbuilder` (Plan 2). Each guide directory has `guide.md`, `expectations.md`, `demo/<files>.cs`, `negative-demo/<files>.cs`, `tasks/task.md`, `grader.ts`. Plan 3 adds the `ggdd-dev` authoring CLI; Plan 4 adds Unity batch grading via the harness.
- `lib/` — shared library code used by both root tooling (`ggdd-dev`, Plan 3) and `guides/` author-time tooling.
- `bin/` — root dev CLI `ggdd-dev` (Plan 3). Commands: `audit`, `dev`, `dev-all`, `gen-grader`, `gen-negative`, `test-grader`, `grade`, `warm-cache` (placeholder), `apiref` (placeholder), `setup-completion`. Not published.
- `harness/` — eval infrastructure (Plan 4): Unity batch-mode runner, agent runners (claude-code primary; codex/gemini/jetski stubs), suite orchestration, metrics, reporting. Plan 4 ships `empty-unity6` base-app via LFS; the brawler/deckbuilder skeletons are placeholders that fall back to `empty-unity6`.
- `eval-view/` — React/Vite dashboard SPA (Plan 5). Reads run results from `harness/runs/` (locally) or from `eval-view/public/data/` (deployed snapshot). `ggdd-dev dashboard` starts the dev server; `ggdd-dev deploy` builds and pushes to GitHub Pages via `gh-pages`.

## Workflow

PR CI runs the preflight workflow (`.github/workflows/preflight.yml`): `npm install` at root and `serving/`, then `node --test` across all test globs, then esbuild bundle verification. Uses Node 22 LTS + npm (not pnpm) due to the pnpm OOM issue noted in Active TODOs. Nightly CI runs the full eval suite (Plan 4 onward).

## Active TODOs

- Telemetry sink (`ClearcutLogger`) is a no-op stub; decide before public launch whether to wire to an opt-in endpoint or strip the code entirely. See spec §8.3 item 1.
- **pnpm install OOMs on this workspace** (pnpm 10.30.3 + Node 24.4.1 + TF.js dep tree → V8 "invalid array length" allocation failure). Workaround: `npm install --ignore-scripts` at root and inside `serving/`. CI uses Node 22 LTS + npm to avoid this. Revisit if pnpm upstream fixes the bug or if the dep tree shrinks (e.g., dropping `@huggingface/transformers` if we can find an alternative tokenizer).
- **Static-only graders.** All Plan 2 graders use static C# analysis only. Unity batch-mode helpers (`unityCompile`, `unityRunEditModeTests`) become available in Plan 4 when the harness lands; some guides may then be revised to `gradeMode: static+unity`.
- **Game-design grader rigor.** Per spec §8.3 item 5, design-pattern graders (hit-stop, knockback, run pacing, rarity, relic readability) are inherently fuzzier than perf graders. Initial graders will under-detect; iterate based on real eval data once Plan 4 ships.
- **LLM generators need ANTHROPIC_API_KEY** to run. Add it to `.env` for `ggdd-dev gen-grader` / `gen-negative`. The dry-run path is exercised in tests so no API quota is consumed by CI.
- **`dev` is currently a thin wrapper around `test-grader`.** The full author loop (auto-generate negative/grader if missing, then run guided agent test) lands when Plan 4's harness ships the agent runners.
- **Stub agent runners.** `codex-cli`, `gemini-cli`, `jetski-cli` throw `NotImplementedError`. Wire them up when needed by adding the relevant CLI invocation logic per `claude-code-agent.ts`.
- **Skeleton base-apps.** `brawler-skeleton` and `deckbuilder-skeleton` are README placeholders. Build them out as real Unity 6 projects (scene + scripts + URP) before the action/deckbuilder guides need genuine project context.
- **Unity batch helpers in test-fixture.** `unityCompile`/`unityRunEditModeTests` exist in `harness/lib/unity-runner.ts` but no grader calls them yet. Wire them into `guides/test-fixture.ts` when a guide upgrades to `gradeMode: static+unity`.
- **Real GCS upload.** `harness/upload_suite.ts` is a no-op stub. Wire it up in Plan 5 when the dashboard needs remote artifacts.
- **Per-assertion drilldown** depends on `RunResult.grader.perAssertion` being populated by the harness. The current `run_suite.ts` writes an empty array; populate it in Plan 6 by parsing `node:test` TAP output or the structured run output of each individual assertion.
- **GitHub Pages deployment** requires the `gh-pages` branch to exist + GitHub Pages enabled in the repo settings (Source = `gh-pages` branch). `ggdd-dev deploy` pushes; you must enable Pages manually in the repo settings.

## See also

- [Design spec](./docs/superpowers/specs/2026-05-27-ggdd-design.md)
- Reference project: `../modern-web-guidance-src` (MWG)
