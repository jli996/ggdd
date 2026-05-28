---
id: procedural-chunk-generation
category: game-design-casual-endless-runner
title: Procedural chunk generation (Temple Run / Subway Surfers chunk pools)
description: Pre-authored chunks (10-20s each) are shuffled per run to create an "infinite" feeling without fully random obstacle placement. Randomness operates at the chunk-sequence level; each individual chunk is hand-tuned for pacing and readability.
useCases:
  - "implement chunk-based level generation in endless runner Unity game"
  - "design level chunk pool for Temple Run or Subway Surfers style game"
  - "pick next chunk by difficulty tier in endless runner"
  - "use ScriptableObject for chunk configuration in runner game"
  - "balance pre-authored vs procedural chunk selection in endless runner"
relatedGuides: []
appliesTo:
  - "endless runner games using chunk-based procedural level generation"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Procedural chunk generation

Temple Run and Subway Surfers do not place obstacles randomly. They select from a hand-crafted pool of level "chunks" (bridge sections, subway cars, rooftops) and string them together in a pseudo-random order. Each chunk is individually designed so its internal obstacle layout is readable at the current run speed. The randomness is only in *which* chunks appear and *in what order* — never in the raw obstacle positions within a chunk.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "Runners/ChunkGenerator")]
public class ChunkGenerator : ScriptableObject
{
    [System.Serializable]
    public class LevelChunk
    {
        public string     chunkName;
        public GameObject chunkPrefab;
        public int        difficultyTier;
        public float      secondsToTraverseAtBaseSpeed;
    }

    [SerializeField] private LevelChunk[] chunkPool;
    [SerializeField] private int          chunksPerRun = 30;

    /// Returns a chunk whose difficultyTier matches the current progression tier.
    public LevelChunk PickNextChunk(int currentDifficultyTier)
    {
        var candidates = System.Array.FindAll(chunkPool,
            c => c.difficultyTier == currentDifficultyTier);

        if (candidates.Length == 0) return chunkPool[0]; // fallback
        return candidates[Random.Range(0, candidates.Length)];
    }
}
```

## Avoid

- Fully random per-obstacle placement — without authoring, obstacles cluster in unreadable patterns at high speed; every experienced endless-runner studio uses a chunk pool.
- One chunk per difficulty tier — variety dries up quickly; aim for 5-10 chunks per tier.
- Repeating the same chunk twice in a row — track the last-picked index and skip it in `PickNextChunk`.

## Gotchas

- `secondsToTraverseAtBaseSpeed` lets the difficulty system (see the companion speed-curve guide) calculate how long a chunk occupies the screen at the current speed.
- Store `chunksPerRun` in the ScriptableObject so designers can tune session length without code changes.
- Pre-warm chunk prefabs with `Physics.SyncTransforms()` after `Instantiate` to avoid first-frame physics jitter.
- Temple Run uses directional turn-triggers at chunk boundaries (left, right, straight); encode turn possibilities as a flags enum on `LevelChunk` for design flexibility.
</content>
