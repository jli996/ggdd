# ggdd

Game Guidance for Development Done-right — curated, token-efficient Unity 6 guidance for coding agents.

Modelled after [`modern-web-guidance-src`](https://github.com/GoogleChrome/modern-web-guidance-src) (MWG), targeting Unity game development across engine usage, performance, and genre-level design patterns.

## Quickstart (Plan 1 scope)

```shell
# From source (until npm publish in Plan 6):
pnpm install
pnpm build
node --experimental-strip-types serving/bin/ggdd.ts search "input system"
node --experimental-strip-types serving/bin/ggdd.ts retrieve "new-input-system-basics"
```

## Layout

See [CONTEXT.md](./CONTEXT.md) for repo orientation. See [docs/superpowers/specs/2026-05-27-ggdd-design.md](./docs/superpowers/specs/2026-05-27-ggdd-design.md) for the v1 design.

## License

Apache-2.0.
