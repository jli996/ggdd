# ggdd repository orientation

## Top-level layout

- `serving/` — npm-publishable package (`name: ggdd`). Runtime CLI + MCP server + vendored MiniLM. Zero network calls, zero API keys, runs offline. Source of truth for what end users get.
- `guides/` — guide content. 72 guides across 23 categories. v2 (Plans 7a-d) covered shooter/platformer/soulslike/AI-perception/strategy/Unity-engine; Plan 8 added 7 casual subgenres (match-3, merge-2, color-sort, lane-switch, clicker-idle, hyper-casual, endless-runner).
- `lib/` — shared library code used by both root tooling (`ggdd-dev`, Plan 3) and `guides/` author-time tooling.
- `bin/` — root dev CLI `ggdd-dev` (Plan 3). Commands: `audit`, `dev`, `dev-all`, `gen-grader`, `gen-negative`, `test-grader`, `grade`, `warm-cache` (placeholder), `apiref` (placeholder), `setup-completion`. Not published.
- `harness/` — eval infrastructure (Plan 4): Unity batch-mode runner, agent runners (claude-code primary; codex/gemini/jetski stubs), suite orchestration, metrics, reporting. Plan 4 ships `empty-unity6` base-app via LFS; the brawler/deckbuilder skeletons are placeholders that fall back to `empty-unity6`.
- `eval-view/` — React/Vite dashboard SPA (Plan 5). Reads run results from `harness/runs/` (locally) or from `eval-view/public/data/` (deployed snapshot). `ggdd-dev dashboard` starts the dev server; `ggdd-dev deploy` builds and pushes to GitHub Pages via `gh-pages`.

## Workflow

PR CI runs the preflight workflow (`.github/workflows/preflight.yml`): `npm install` at root and `serving/`, then `node --test` across all test globs, then esbuild bundle verification. Uses Node 22 LTS + npm (not pnpm) due to the pnpm OOM issue noted in Active TODOs. Nightly CI runs the full eval suite (Plan 4 onward).

## Active TODOs

- **Real Unity-batch grader integration**: `guides/test-fixture.ts` exposes `unityCompile` / `unityRunEditModeTests` (via `harness/lib/unity-runner.ts`) but no grader actually calls them yet. The `gc-free-update-loop` guide is marked `gradeMode: static+unity` so the first guide to wire it up is unambiguous. Land when there's a meaningful behavioral check that static analysis can't cover.
- **Brawler / deckbuilder skeleton base-apps**: `harness/base_apps/{brawler,deckbuilder}-skeleton/` are README placeholders. Build out as real Unity projects when their guides need genre-specific scene/script context.
- **Stub agent runners**: codex-cli, gemini-cli, jetski-cli throw `NotImplementedError`. Wire up when needed (claude-code is real and primary).
- **pnpm install OOMs on this dep tree** — use npm. See `project_ggdd_pnpm_oom` memory.
- **`ANTHROPIC_API_KEY`** required for `ggdd-dev gen-grader` / `gen-negative` at runtime; tests use dry-run mode and consume no quota.
- **`GGDD_GCS_BUCKET`** optional — without it `ggdd-dev upload` is a no-op. Set to enable GCS upload (currently a placeholder; wire the actual upload when the dashboard moves to remote artifacts).
- **GitHub Pages enable step**: `ggdd-dev deploy` pushes to the `gh-pages` branch; you must enable Pages source = `gh-pages` in the repo settings the first time.
- **npm publish**: not automated. Run `cd serving && npm publish --access public` when ready. Requires npm credentials.

- **Shooter base-app skeleton**: `harness/base_apps/shooter-skeleton/` is not yet created. All 12 shooter design guides currently point at `empty-unity6` as their baseApp. Build out a shooter skeleton (basic FPS player + weapon + enemy) when these guides need genuine project context.
- **Platformer / soulslike / AI base-app skeletons**: all Plan 7b guides currently point at `empty-unity6`. Build out genre-specific skeletons when guides need real project context.

## See also

- [Design spec](./docs/superpowers/specs/2026-05-27-ggdd-design.md)
- Reference project: `../modern-web-guidance-src` (MWG)
