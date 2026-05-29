---
id: hub-and-spoke-world
category: game-design-platformer-3d-collectathon
title: Hub-and-spoke world structure (Metroidvania-light backtracking)
description: A central hub world acts as a save point and level select. Sub-worlds have internal arcs. New abilities unlock backtracking into earlier worlds, giving collectibles a second life and rewarding returning players.
useCases:
  - "Mario 64 hub world design"
  - "Banjo-Kazooie world unlock structure"
  - "3D collectathon level select hub"
  - "ability-gated world access design"
  - "Metroidvania-light backtracking for collectathons"
relatedGuides:
  - collectible-density-clumping
  - non-fighting-camera
appliesTo:
  - "any 3D collectathon with a central hub and distinct sub-worlds accessible via the hub"
tags: [platformer, 3d-collectathon, progression, meta-progression]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Hub-and-spoke world structure

Mario 64's Peach's Castle is the canonical hub: a single explorable space that opens doors to painting worlds. Each world is self-contained. Gaining new caps (Wing, Metal, Vanish) lets you return to earlier worlds and find previously inaccessible stars.

Three structural principles:
1. **Hub as neutral territory**: no enemies, ambient music, acts as breathing room between challenge worlds.
2. **Sub-world internal arc**: each world has a beginning, middle, and end within its own theme. The player should feel they have "done" a world before leaving.
3. **Backtracking incentive**: at least one collectible per sub-world should require an ability earned later in the game, ensuring a reason to return.

## Implementation

```csharp
using UnityEngine;

public enum PlayerAbility { None, DoubleJump, Dash, Glide, WallJump, Swim }

[CreateAssetMenu(fileName = "WorldStructure", menuName = "Game/World Structure")]
public class WorldStructure : ScriptableObject
{
    [System.Serializable]
    public class SubWorld
    {
        public string worldName;
        public PlayerAbility unlockedByAbility;   // ability required to enter (None = always open)
        public int internalCollectibles;          // how many collectibles live in this world
    }

    public SubWorld hub;        // the hub world itself
    public SubWorld[] subWorlds;

    /// <summary>Returns true if the player has the ability required to access this world.</summary>
    public bool CanAccess(SubWorld world, PlayerAbility[] playerAbilities)
    {
        if (world == null) return false;
        if (world.unlockedByAbility == PlayerAbility.None) return true;
        if (playerAbilities == null) return false;
        foreach (var ability in playerAbilities)
        {
            if (ability == world.unlockedByAbility) return true;
        }
        return false;
    }

    /// <summary>Returns all sub-worlds accessible given the player's current abilities.</summary>
    public SubWorld[] AccessibleWorlds(PlayerAbility[] playerAbilities)
    {
        if (subWorlds == null) return System.Array.Empty<SubWorld>();
        var result = new System.Collections.Generic.List<SubWorld>();
        foreach (var w in subWorlds)
        {
            if (CanAccess(w, playerAbilities)) result.Add(w);
        }
        return result.ToArray();
    }
}
```

## Avoid

- Locking all worlds behind a single sequential gate — players can't choose which world to visit next.
- Ability gates on the hub itself — the hub must always be reachable as a safe restart point.
- Sub-worlds with zero backtracking incentives — if players have no reason to return, the late-game world count feels smaller.

## Gotchas

- `PlayerAbility.None` is the sentinel for "always accessible" — avoids null checks throughout the codebase.
- Hub as a `SubWorld` struct allows consistent serialization (same Inspector fields) while letting designers place hub-specific collectibles.
- `AccessibleWorlds` should be called on every scene load, not cached, since ability state can change mid-session.
