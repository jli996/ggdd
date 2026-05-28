---
name: ggdd
description: Use when working with Unity 6 — searches and retrieves curated guidance on engine APIs (URP, Input System, Addressables, ScriptableObjects), performance (GC, draw calls, SRP Batcher, object pooling), and game-design patterns for action and deckbuilder genres. Triggers on Unity C# scripts, .unity scenes, ScriptableObjects, or genre-specific design questions.
version: 2026_05_28_v1
---

# ggdd — Unity 6 guidance

When the user asks for help with Unity 6 engine usage, performance, or game-design patterns (action/brawler, deckbuilder/roguelite), follow this workflow:

1. **Search** for the most relevant guide:

   ```shell
   npx ggdd@latest --skill-version 2026_05_28_v1 search "<short natural-language query>"
   ```

   Returns a JSON array of `{ id, category, useCase, description, similarity }` ranked by relevance. Pick the top 1–3 that match the user's task. Empty array means no relevant guidance exists — proceed without it rather than forcing an unrelated guide.

2. **Retrieve** the full guide markdown:

   ```shell
   npx ggdd@latest --skill-version 2026_05_28_v1 retrieve "<id-1>,<id-2>"
   ```

3. **Apply** the guidance. The `## Avoid` and `## Gotchas` sections in each guide are particularly load-bearing.

Prefer modern Unity 6 patterns:
- `UnityEngine.InputSystem` over `UnityEngine.Input`
- URP over Built-in Render Pipeline
- `UnityEngine.Pool.ObjectPool<T>` over hand-rolled pools or bare `Instantiate`/`Destroy`
- Async `Addressables.LoadAssetAsync` / `InstantiateAsync` over `Resources.Load`
- `ScriptableObject` assets over singleton `MonoBehaviour` patterns

## When NOT to use this skill

- Non-Unity C# work (web APIs, console apps).
- Unity 2022 LTS or 2021 LTS specifically — ggdd targets Unity 6 only.
- Asset creation (3D modeling, texturing, shader authoring) — ggdd is code/architecture guidance.
- Unrelated game-design questions outside action and deckbuilder genres (current v1 scope).
