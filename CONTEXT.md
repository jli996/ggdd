# ggdd repository orientation

## Top-level layout

- `serving/` — npm-publishable package (`name: ggdd`). Runtime CLI + MCP server + vendored MiniLM. Zero network calls, zero API keys, runs offline. Source of truth for what end users get.
- `guides/` — guide content (Plan 2). One directory per guide under `guides/<category>/<guide-id>/`.
- `lib/` — shared library code used by both root tooling (`ggdd-dev`, Plan 3) and `guides/` author-time tooling.
- `bin/` — root dev CLI (`ggdd-dev`, Plan 3). Not published.
- `harness/` — eval infrastructure (Plan 4). Unity base-apps, agent runners.
- `eval-view/` — dashboard SPA (Plan 5).

## Workflow

PR CI runs the preflight workflow (`.github/workflows/preflight.yml`): `npm install` at root and `serving/`, then `node --test` across all test globs, then esbuild bundle verification. Uses Node 22 LTS + npm (not pnpm) due to the pnpm OOM issue noted in Active TODOs. Nightly CI runs the full eval suite (Plan 4 onward).

## Active TODOs

- Telemetry sink (`ClearcutLogger`) is a no-op stub; decide before public launch whether to wire to an opt-in endpoint or strip the code entirely. See spec §8.3 item 1.
- **pnpm install OOMs on this workspace** (pnpm 10.30.3 + Node 24.4.1 + TF.js dep tree → V8 "invalid array length" allocation failure). Workaround: `npm install --ignore-scripts` at root and inside `serving/`. CI uses Node 22 LTS + npm to avoid this. Revisit if pnpm upstream fixes the bug or if the dep tree shrinks (e.g., dropping `@huggingface/transformers` if we can find an alternative tokenizer).

## See also

- [Design spec](./docs/superpowers/specs/2026-05-27-ggdd-design.md)
- Reference project: `../modern-web-guidance-src` (MWG)
