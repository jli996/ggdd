# Launch checklist

Manual steps to ship ggdd v1.0.0. None of these are automated — each needs credentials or a UI click.

## Test the CLI locally first

Before publishing, smoke-test the bundled CLI:

```shell
# (one-time) refresh the bundle
cd serving
node --experimental-strip-types skills-cli/build-dist.ts
cd ..

# Plain node, no flags — this is what npm users will get:
node serving/build/ggdd.js --version
node serving/build/ggdd.js list
node serving/build/ggdd.js search "object pooling in Unity"
node serving/build/ggdd.js retrieve "object-pooling-basics"

# The dev CLI (root, source-mode):
node --experimental-strip-types bin/ggdd-dev.ts audit
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader

# Dashboard (long-running — Ctrl+C to stop):
node --experimental-strip-types bin/ggdd-dev.ts dashboard

# MCP server smoke (long-running — Ctrl+C):
node serving/build/mcp-server.js
# Then in another terminal pipe a JSON-RPC initialize handshake.
```

If anything fails, fix it before doing the steps below.

---

## Launch-critical (release v1)

### 1. Publish `ggdd` to npm

```shell
cd serving

# One-time per machine:
npm login                       # opens browser, requires npm account + 2FA

# Verify the tarball contents look right before publishing:
npm pack --dry-run              # lists what will ship
# Expected: build/ggdd.js, build/mcp-server.js, build/tfjs_model_minilm/,
#           build/use-cases.gen.ts, build/embeddings.gen.bin,
#           build/SKILL.md, build/plugin.json, build/skill-version.txt,
#           build/megaskill.md, package.json, README.md.
# Should NOT include: src files, tests, node_modules, the serving/lib source.

# Publish (irreversible at this version number — bump if you need a redo):
npm publish --access public
```

After publish, verify:

```shell
# A user's invocation:
npx ggdd@1.0.0 --version          # should print 1.0.0
npx ggdd@latest search "input"    # should return the new-input-system-basics guide
```

If a critical bug ships, you can `npm deprecate ggdd@1.0.0 "<reason>"` and publish `1.0.1`.

### 2. Enable GitHub Pages for the dashboard

The deploy step pushes to a `gh-pages` branch but Pages must be enabled in the repo settings:

1. Open https://github.com/jli996/ggdd/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **`gh-pages`** / Folder: **`/ (root)`**
4. Save.

Then deploy:

```shell
node --experimental-strip-types bin/ggdd-dev.ts deploy
```

First deploy takes 1–2 minutes to build + push. After it completes, GitHub will provision the site at https://jli996.github.io/ggdd/ (allow another minute for DNS).

### 3. Register the Claude Code plugin

After npm publish:

1. Make sure the repo is public (https://github.com/jli996/ggdd/settings → General → Danger Zone, if it's private).
2. The plugin manifest lives at `serving/skills-cli/template/plugin.json` and gets copied into the published `build/plugin.json`. Users install via:

   ```
   /plugin marketplace add jli996/ggdd
   /plugin install ggdd@jli996
   ```

3. Tell your users about it (Discord / Twitter / wherever Unity-Claude users hang out).

---

## Nice-to-have follow-ups (post-v1)

These are tracked in CONTEXT.md and don't block launch:

- **Real Unity-batch grader integration**: `harness/lib/unity-runner.ts` has `unityCompile` / `unityRunTests` but no grader actually calls them. `gc-free-update-loop` is already marked `gradeMode: static+unity` — first guide to wire it up.
- **Brawler / deckbuilder skeleton base-apps**: `harness/base_apps/{brawler,deckbuilder}-skeleton/` are README placeholders. Build them out when their guides need genre-specific scene context.
- **Stub agent runners**: `codex-cli`, `gemini-cli`, `jetski-cli` throw `NotImplementedError`. Wire up when needed.
- **Real GCS upload**: `harness/upload_suite.ts` is a no-op stub. Wire when the dashboard moves to remote artifacts.
- **Additional distribution channels**: Vercel Skills CLI, GitHub Copilot marketplace, Google Antigravity. Each is a manifest entry pointing at the published npm package — additive.

## Quality-bar follow-ups for the next minor release

- **`FixedUpdate` body regex** in `guides/unity-performance/gc-free-update-loop/grader.ts` breaks on nested braces. Switch to brace-counting (or use `methodCallsAst` from test-fixture).
- **More guides per category**: spec §1.1 anticipates more genre coverage (shooter, platformer, survival, simulation, citybuilder). Each is an isolated content addition; the harness pattern generalizes.
- **Multi-stamp time-series in eval-view**: the dashboard renders one snapshot at a time. Add per-guide pass-rate-over-time as runs accumulate.
