---
id: level-as-race-track
category: game-design-platformer-momentum
title: Level as race track — parallel paths at skill tiers
description: Levels in momentum platformers have parallel paths at different skill tiers. The optimal route is faster and riskier; the safe route is survivable but slow. Skilled players rocket through; casual players still complete the level.
useCases:
  - "Sonic level design parallel paths"
  - "momentum platformer level design"
  - "skill tier routing in level design"
  - "safe vs optimal path platformer"
  - "level design for speed running"
relatedGuides:
  - momentum-preservation-transitions
appliesTo:
  - "any momentum-based platformer where speed and routing are a skill expression"
tags: [platformer, momentum-platformer, replayability, variety]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Level as race track — parallel paths at skill tiers

Sonic's Green Hill Zone is the canonical example: a casual player walks right, collecting rings on a flat path. A skilled player finds the loop, preserves speed, and rockets to the goal post in 30 seconds. Both reach the end — but the skill ceiling reward is felt immediately.

This design principle — **parallel routes at different skill/speed thresholds** — keeps a momentum platformer accessible without boring experienced players.

## Implementation

A ScriptableObject describing a level's routing options. Each route has a required entry speed, a risk level, and an expected clear time.

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "LevelRoute", menuName = "Game/Level Route")]
public class LevelRoute : ScriptableObject
{
    [System.Serializable]
    public class RoutePath
    {
        public string pathName;
        public float requiredSpeed;      // minimum entry speed (0 = open to all)
        public int riskLevel;            // 1=safe, 2=moderate, 3=risky
        public float estimatedSeconds;   // expected clear time for this path
    }

    public RoutePath[] paths;

    /// <summary>Returns the expected clear time of the fastest path.</summary>
    public float OptimalPathSeconds()
    {
        if (paths == null || paths.Length == 0) return float.MaxValue;
        float best = float.MaxValue;
        foreach (var p in paths)
        {
            if (p.estimatedSeconds < best) best = p.estimatedSeconds;
        }
        return best;
    }
}
```

## Avoid

- A single linear path — removes routing as skill expression entirely.
- All paths requiring high speed — casual players are locked out.
- Risk levels that are purely cosmetic with no actual gameplay difference — wastes the concept.

## Gotchas

- The optimal path should require maintaining momentum from earlier in the level — reward sustained play, not a single well-timed jump.
- `requiredSpeed = 0` on the safe path ensures all players can complete the level.
- Risk and speed don't always correlate — a tricky shortcut might be low-speed but high-platform-precision.
