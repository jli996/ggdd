---
id: tight-respawn-loop
category: game-design-platformer-precision
title: Tight respawn loop for precision platformers
description: In a precision platformer (Celeste, Super Meat Boy), death is part of the iteration loop. Keep death-to-respawn under 1 second, checkpoint generously, preserve momentum-context after death.
useCases:
  - "design respawn for precision platformer"
  - "Celeste style instant respawn"
  - "death-to-respawn time tuning"
  - "checkpoint density platformer"
  - "minimize player frustration on death"
relatedGuides: []
appliesTo:
  - "any precision platformer where death is expected and frequent"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Tight respawn loop

In a precision platformer, the player dies hundreds of times per session — that's the gameplay loop. The death-to-respawn cycle must be FAST and FRICTIONLESS, or each death compounds frustration.

Three knobs:
1. **Respawn delay < 1 second**: from death animation start to controllable character at checkpoint.
2. **Checkpoint density**: ideally one per screen / room. Save the player from re-traversing trivial sections.
3. **Preserve attempt context**: keep death count, time elapsed, and run state visible so the player feels iteration, not setback.

## Implementation

```csharp
using UnityEngine;

public class RespawnSystem : MonoBehaviour
{
    [SerializeField] private float respawnDelaySeconds = 0.4f;
    [SerializeField] private Transform currentCheckpoint;
    [SerializeField] private int deathCount = 0;
    [SerializeField] private float runStartedAt;

    public void OnPlayerDeath(Transform player)
    {
        deathCount++;
        Invoke(nameof(RespawnPlayer), respawnDelaySeconds);
    }

    private void RespawnPlayer()
    {
        // Reset to checkpoint, restore controls instantly.
    }

    public void SetCheckpoint(Transform t) { currentCheckpoint = t; }
}
```

## Avoid

- Long death animations (>1s) — kills iteration rhythm.
- Respawn at the start of a level instead of at a checkpoint — punishes the player for not completing in one run.
- Loading screens between deaths — dead time, breaks flow.
- Hiding death count or run timer — players want to see their iteration metrics.

## Gotchas

- "Respawn at checkpoint" doesn't mean teleport instantly — a brief fade-in (~200ms) cushions the visual.
- Checkpoints should be on success milestones (cleared an obstacle), not every few pixels.
- Death animation should be short BUT satisfying — Celeste's wall-crash particles take ~400ms.
