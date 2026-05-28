# ggdd

Game Guidance for Development Done-right — curated Unity 6 guidance for coding agents.

```shell
npx ggdd@latest install
```

Drops `SKILL.md` + `plugin.json` so your coding agent (Claude Code, Codex, Gemini CLI, etc.) can discover and consume the guidance via two CLI commands.

## Try it without installing

```shell
# Search the catalog
npx ggdd@latest search "object pooling in Unity"

# Retrieve a guide
npx ggdd@latest retrieve "object-pooling-basics"

# List all 12 guides
npx ggdd@latest list
```

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

```json
{
  "mcpServers": {
    "ggdd": {
      "command": "npx",
      "args": ["-y", "ggdd@latest", "mcp-server"]
    }
  }
}
```

Exposes two tools: `ggdd_search` and `ggdd_retrieve`.

## Requires

Node 22 or newer.

## License

Apache-2.0.
