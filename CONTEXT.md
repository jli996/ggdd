# ggdd repository orientation

## Top-level layout

- `serving/` — npm-publishable package (`name: ggdd`). Runtime CLI + MCP server + vendored MiniLM. Zero network calls, zero API keys, runs offline. Source of truth for what end users get.
- `guides/` — guide content. 12 guides seeded across `unity-engine`, `unity-performance`, `game-design-action`, `game-design-deckbuilder` (Plan 2). Each guide directory has `guide.md`, `expectations.md`, `demo/<files>.cs`, `negative-demo/<files>.cs`, `tasks/task.md`, `grader.ts`. Plan 3 adds the `ggdd-dev` authoring CLI; Plan 4 adds Unity batch grading via the harness.
- `lib/` — shared library code used by both root tooling (`ggdd-dev`, Plan 3) and `guides/` author-time tooling.
- `bin/` — root dev CLI (`ggdd-dev`, Plan 3). Not published.
- `harness/` — eval infrastructure (Plan 4). Unity base-apps, agent runners.
- `eval-view/` — dashboard SPA (Plan 5).

## Workflow

PR CI runs the preflight workflow (`.github/workflows/preflight.yml`): `npm install` at root and `serving/`, then `node --test` across all test globs, then esbuild bundle verification. Uses Node 22 LTS + npm (not pnpm) due to the pnpm OOM issue noted in Active TODOs. Nightly CI runs the full eval suite (Plan 4 onward).

## Active TODOs

- Telemetry sink (`ClearcutLogger`) is a no-op stub; decide before public launch whether to wire to an opt-in endpoint or strip the code entirely. See spec §8.3 item 1.
- **pnpm install OOMs on this workspace** (pnpm 10.30.3 + Node 24.4.1 + TF.js dep tree → V8 "invalid array length" allocation failure). Workaround: `npm install --ignore-scripts` at root and inside `serving/`. CI uses Node 22 LTS + npm to avoid this. Revisit if pnpm upstream fixes the bug or if the dep tree shrinks (e.g., dropping `@huggingface/transformers` if we can find an alternative tokenizer).
- **Static-only graders.** All Plan 2 graders use static C# analysis only. Unity batch-mode helpers (`unityCompile`, `unityRunEditModeTests`) become available in Plan 4 when the harness lands; some guides may then be revised to `gradeMode: static+unity`.
- **Game-design grader rigor.** Per spec §8.3 item 5, design-pattern graders (hit-stop, knockback, run pacing, rarity, relic readability) are inherently fuzzier than perf graders. Initial graders will under-detect; iterate based on real eval data once Plan 4 ships.

## See also

- [Design spec](./docs/superpowers/specs/2026-05-27-ggdd-design.md)
- Reference project: `../modern-web-guidance-src` (MWG)
