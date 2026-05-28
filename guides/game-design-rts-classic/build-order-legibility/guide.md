---
id: build-order-legibility
category: game-design-rts-classic
title: Build order legibility (scouting window, archetype identification)
description: An opponent's strategy should be identifiable within 30 seconds of scouting. Buildings have visible silhouettes whose archetypes (Economy, Tech, Military) reveal intent, letting the scouting player adapt their build.
useCases:
  - "design rts scouting window for build order detection"
  - "building archetype identification in rts"
  - "opponent strategy inference from scouted buildings"
  - "tech tree branch legibility design"
  - "rts build order counter-play design"
relatedGuides: []
appliesTo:
  - "any real-time strategy game with scouting and tech-tree mechanics"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Build order legibility

Players must be able to react to an opponent's strategy — but only if they can identify it. The scouting window (typically 30 seconds) defines how long a scout can observe before being repelled. During this window, the player should be able to classify the enemy's dominant archetype and adjust their own build accordingly.

## Implementation

```csharp
using UnityEngine;
using System.Linq;

public enum BuildingArchetype { Economy, Tech, MilitaryRanged, MilitaryMelee, Defense }

public class BuildOrderScout : MonoBehaviour
{
    [SerializeField] private float scoutWindowSeconds = 30f;
    [SerializeField] private float buildingVisibilityRadius = 200f;

    /// Returns the most frequently seen archetype among scouted buildings.
    public BuildingArchetype IdentifyStrategy(BuildingArchetype[] scoutedBuildings)
    {
        if (scoutedBuildings == null || scoutedBuildings.Length == 0)
            return BuildingArchetype.Economy;

        BuildingArchetype dominant = scoutedBuildings
            .GroupBy(a => a)
            .OrderByDescending(g => g.Count())
            .First().Key;

        return dominant;
    }
}
```

## Avoid

- Scouting windows below 15 seconds — the player cannot gather enough information to classify the strategy.
- Buildings that look identical in silhouette — players must distinguish Economy from Military at a glance.
- Returning a hard-coded archetype regardless of what was scouted — defeats adaptive gameplay.
- Missing a "Defense" archetype — turtle builds must be identifiable so players know to switch to siege strategies.

## Gotchas

- `scoutWindowSeconds` should be tuned alongside the scouting unit's speed and the map scale — a 30s window on a 300m map is very different from on a 1000m map.
- `buildingVisibilityRadius` determines how many buildings are "seen" during the scout run; too small and the scout only sees the outer wall.
- The dominant archetype heuristic (most-frequent) is a starting point; later refinement can weight tech buildings more heavily since they reveal intent faster.
- Buildings under construction should count at a reduced weight — seeing the foundations of a barracks tells you less than a completed one.
