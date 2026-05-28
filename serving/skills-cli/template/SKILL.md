---
name: ggdd
description: Use when working with Unity 6 — searches and retrieves curated guidance on engine APIs (URP, Input System, Addressables), performance (GC, draw calls, SRP Batcher), and game-design patterns (action, deckbuilder). Triggers on tasks involving Unity C# scripts, .unity scenes, ScriptableObjects, or genre-specific design questions.
version: 2026_05_27_v1
---

# ggdd — Unity 6 guidance

When the user asks for help with Unity engine usage, Unity performance, or game design patterns for action/brawler or deckbuilder/roguelike genres, follow this workflow:

1. **Search**: invoke the CLI to find relevant guides.

   ```shell
   npx ggdd@latest --skill-version 2026_05_27_v1 search "<short natural-language query>"
   ```

   Returns a JSON array of `{ id, category, useCase, description, similarity }` ranked by relevance. Pick the top 1–3 that match the user's task.

2. **Retrieve**: pull the full guide markdown for the chosen ids.

   ```shell
   npx ggdd@latest --skill-version 2026_05_27_v1 retrieve "<id-1>,<id-2>"
   ```

3. **Apply**: follow the guidance, especially the `## Avoid` and `## Gotchas` sections.

Prefer modern Unity 6 patterns. Avoid legacy APIs (`UnityEngine.Input`, Built-in Render Pipeline, GameObject.FindObjectOfType in hot paths) unless the user explicitly asks for them.

## When NOT to use this skill

- Non-Unity C# work (web APIs, console apps).
- Unity 2022 LTS or 2021 LTS specifically — ggdd targets Unity 6 only.
- Asset creation (3D modeling, texturing) — ggdd is code/architecture guidance.
