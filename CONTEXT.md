# ggdd repository orientation

## Top-level layout

- `serving/` — npm-publishable package (`name: ggdd`). Runtime CLI + MCP server + vendored MiniLM. Zero network calls, zero API keys, runs offline. Source of truth for what end users get.
- `guides/` — guide content (Plan 2). One directory per guide under `guides/<category>/<guide-id>/`.
- `lib/` — shared library code used by both root tooling (`ggdd-dev`, Plan 3) and `guides/` author-time tooling.
- `bin/` — root dev CLI (`ggdd-dev`, Plan 3). Not published.
- `harness/` — eval infrastructure (Plan 4). Unity base-apps, agent runners.
- `eval-view/` — dashboard SPA (Plan 5).

## Workflow

PR CI runs `pnpm preflight` (build + typecheck + lint + tests). Nightly CI runs the full eval suite (Plan 4 onward).

## Active TODOs

- Telemetry sink (`ClearcutLogger`) is a no-op stub; decide before public launch whether to wire to an opt-in endpoint or strip the code entirely. See spec §8.3 item 1.

## See also

- [Design spec](./docs/superpowers/specs/2026-05-27-ggdd-design.md)
- Reference project: `../modern-web-guidance-src` (MWG)
