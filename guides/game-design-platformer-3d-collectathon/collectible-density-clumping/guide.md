---
id: collectible-density-clumping
category: game-design-platformer-3d-collectathon
title: Collectible density clumping — room-scale beats over world-scale scatter
description: Collectibles (coins, jiggies, stars) should be clumped into purposeful "beats" at room scale rather than evenly scattered across the world. Even scatter feels tedious; clumps create discoverable moments.
useCases:
  - "Mario 64 coin and star placement"
  - "Banjo-Kazooie jiggie density design"
  - "3D collectathon collectible layout"
  - "avoid collectible scatter in open world"
  - "room-scale collectible beat design"
relatedGuides: []
appliesTo:
  - "any 3D collectathon where discovering and collecting items is a primary gameplay loop"
tags: [platformer, 3d-collectathon, pacing, replayability]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Collectible density clumping

Mario 64's coins are not evenly distributed. They form trails leading to secrets, clusters rewarding exploration of a nook, and rings that teach the player to look up. Even scatter across a large world feels like chores — clumping creates memorable "this is the thing here" beats.

Two levels of density:
1. **Room-scale clumps**: each room or area has a focal beat — a chest with a jigsaw piece, a platforming challenge with a star at the end.
2. **Micro-clumps**: coins in a trail or ring that guide the player through the space.

## Implementation

A ScriptableObject that tracks clumps per room, with ability requirements and collectible counts per clump.

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "CollectibleLayout", menuName = "Game/Collectible Layout")]
public class CollectibleLayout : ScriptableObject
{
    [System.Serializable]
    public class CollectibleClump
    {
        public string roomName;
        public int count;               // number of collectibles in this clump (> 1 for a meaningful beat)
        public string requiresAbility;  // e.g. "DoubleJump", "" for always accessible
    }

    public CollectibleClump[] clumps;

    public int TotalCollectibles()
    {
        if (clumps == null) return 0;
        int total = 0;
        foreach (var c in clumps) total += c.count;
        return total;
    }

    public bool IsRoomEmpty(string roomName)
    {
        if (clumps == null) return true;
        foreach (var c in clumps)
        {
            if (c.roomName == roomName && c.count > 0) return false;
        }
        return true;
    }
}
```

## Avoid

- Uniform scatter: 1 coin per room across 60 rooms feels like pixel hunting.
- Clumps without ability gating in late-game areas — trivializes exploration reward.
- All collectibles accessible from the start — nothing to revisit with new abilities.

## Gotchas

- `requiresAbility` should be an empty string (not null) for always-accessible clumps — simplifies equality checks at runtime.
- `count > 1` per clump is the minimum for a meaningful beat — a single coin is a lure, not a reward.
- Track `roomName` per clump so the level designer can see density-per-room at a glance in the editor.
