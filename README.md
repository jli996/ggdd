# ggdd

Game Guidance for Development Done-right — curated, token-efficient Unity 6 guidance for coding agents.

Modelled after [`modern-web-guidance-src`](https://github.com/GoogleChrome/modern-web-guidance-src) (MWG), targeting Unity game development across engine usage, performance, and genre-level design patterns.

## Quickstart

```shell
# Install the skill in your coding agent:
npx ggdd@latest install

# Or use the search/retrieve commands directly:
npx ggdd@latest search "input system in Unity"
npx ggdd@latest retrieve "new-input-system-basics"
```

See [`serving/README.md`](./serving/README.md) for end-user documentation.

## Development

```shell
# Use npm (not pnpm — see CONTEXT.md for the OOM workaround):
npm install --ignore-scripts
cd serving && npm install --ignore-scripts && cd ..

# Run the full preflight
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts'
cd serving && node --experimental-strip-types --test --test-timeout 60000 '**/*.test.ts' && cd ..
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader

# Spin up the eval dashboard
node --experimental-strip-types bin/ggdd-dev.ts dashboard
```

See [CONTEXT.md](./CONTEXT.md) for repo orientation. See [docs/superpowers/specs/2026-05-27-ggdd-design.md](./docs/superpowers/specs/2026-05-27-ggdd-design.md) for the v1 design.

## License

Apache-2.0.
