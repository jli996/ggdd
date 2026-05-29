---
id: stuck-state-prevention
category: game-design-casual-merge-2
title: Stuck state prevention (board capacity, sell mechanic, despawn timers)
description: A full merge board with no valid merges is a stuck state that frustrates players into churning. Prevent it with reserved spawn slots, a sell mechanic, and idle-item despawn timers.
useCases:
  - "prevent stuck state in merge-2 game board"
  - "implement sell mechanic for merge board management"
  - "add idle item despawn timer in Merge Mansion style"
  - "reserve spawn slots to keep merge board playable"
  - "detect unwinnable board state in merge puzzle game"
relatedGuides: []
appliesTo:
  - "merge-2 games with grid-based boards that can fill up"
tags: [puzzle, casual, merge-2, quality-of-life, accessibility, mobile-first]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Stuck state prevention

Merge Mansion and Merge Dragons both have safeguards against board deadlock. A full board where no two items match is a hard stop — players cannot spawn new items or merge anything. The solution is layered: reserve spawn slots so the board never truly fills, let players sell unwanted items for a small coin return, and auto-despawn idle items after a timeout.

## Implementation

```csharp
using UnityEngine;

public class MergeBoardGuard : MonoBehaviour
{
    [SerializeField] private int boardCapacity = 36;
    [SerializeField] private int spawnReservedSlots = 4;
    [SerializeField] private float idleItemDespawnSeconds = 600f;
    [SerializeField] private bool sellEnabled = true;

    /// Returns true if a new item can be spawned without violating reserved slots.
    public bool CanAcceptSpawn(int currentItemCount)
    {
        return currentItemCount + spawnReservedSlots <= boardCapacity;
    }

    /// Returns true if the board is in a stuck state: full and no merges pending.
    public bool WouldBeStuck(int currentItemCount, int pendingMergeCount)
    {
        return currentItemCount >= boardCapacity && pendingMergeCount == 0;
    }
}
```

## Avoid

- Allowing the board to reach 100% capacity with no spawn reserve — even one unmergeables fills the last slot and triggers a stuck state.
- No sell mechanic (`sellEnabled = false`) with no alternative drain — players accumulate junk items they cannot remove.
- Very long despawn timers (> 30 min) — idle items that sit forever give players the impression that the board is "done" and they stop engaging.
- Checking stuck state only on spawn — also check after every merge resolves, since a merge can produce a new unmergeable that fills the last slot.

## Gotchas

- `spawnReservedSlots = 4` means the effective playable board is `boardCapacity - 4 = 32` slots; keep that in mind when designing board layouts.
- In Merge Mansion the sell price is intentionally low (~10-20% of item value) so selling is always a last resort, not a farming loop.
- `idleItemDespawnSeconds` should reset whenever the player interacts with an item (taps it, moves it, or merges it) — only truly ignored items should despawn.
- `WouldBeStuck` with `pendingMergeCount == 0` is an approximation; the full check should verify that no two items on the board share a tier, which requires board state access.
</content>
