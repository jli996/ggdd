---
id: full-loot-economy-with-friction
category: game-design-shooter-survival
title: Full-loot economy with friction (decay, raid windows, vault caps)
description: In a full-loot survival shooter, death drops everything — but the meta-economy needs friction (item decay, base-raid windows, vault size caps) to prevent runaway accumulation by top players.
useCases:
  - "design loot economy in survival shooter"
  - "prevent gear hoarding in PvP survival"
  - "Rust base raid window design"
  - "item degradation and decay timer"
  - "vault cap and storage friction"
relatedGuides:
  - persistent-world-session-join
appliesTo:
  - "any survival shooter where death drops loot AND players persist gear between sessions"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Full-loot economy with friction

A full-loot survival shooter's primary engagement loop is "gear up → risk gear → die or extract." But without friction, top players hoard gear faster than they can lose it, and new players face a permanent disadvantage.

Three friction mechanisms keep the economy churning:
1. **Item degradation**: gear loses durability with use, eventually breaks
2. **Base raid windows**: stored loot is vulnerable for a few hours per day
3. **Vault size caps**: storage is finite; surplus has to leave the economy somehow

## Implementation pattern

```csharp
using UnityEngine;

public class LootDecay : MonoBehaviour
{
    [SerializeField] private float decayPerUse = 0.02f;
    [SerializeField] private int vaultMaxItems = 32;
    [SerializeField] private float raidWindowStartHour = 18f;
    [SerializeField] private float raidWindowDurationHours = 4f;

    public float ApplyDurabilityLoss(float currentDurability)
    {
        return Mathf.Max(0f, currentDurability - decayPerUse);
    }

    public bool CanAddToVault(int currentVaultCount)
    {
        return currentVaultCount < vaultMaxItems;
    }

    public bool IsRaidWindowOpen(float serverHour)
    {
        return serverHour >= raidWindowStartHour
            && serverHour < raidWindowStartHour + raidWindowDurationHours;
    }
}
```

## Avoid

- Indestructible gear in a full-loot game — top players accumulate forever; the economy becomes one-way.
- 24/7 raid windows — players can never log off; turns the game into a job.
- Unlimited vaults — same issue as indestructible gear; the surplus has nowhere to go.
- Decay so steep that gear breaks before the player can use it meaningfully — kills the gear-acquisition reward loop.

## Gotchas

- Raid windows should be telegraphed (in-game clock, server message) so defenders can plan.
- Item categories may decay at different rates (e.g., weapons faster than backpacks). Tune per-category, not global.
- Vault caps interact with player count — solo cap of 32 may be fine, but a 5-person clan needs 5× storage. Tier vault size by group size.
