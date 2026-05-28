---
id: loot-value-tiers-with-snowball-caps
category: game-design-shooter-extraction
title: Loot value tiers with snowball caps (rare drops + insurance/secure)
description: Tiered loot value drives risk-taking in extraction shooters. Rare top-tier loot must feel earned (~5% drop), and snowball is capped via insurance / secure containers so a single bad raid doesn't wipe a season's progress.
useCases:
  - "design loot tiers in extraction shooter"
  - "Tarkov secure container design"
  - "snowball prevention extraction shooter"
  - "tiered loot drop rates"
  - "insurance system for raid death"
relatedGuides:
  - raid-extract-loop-with-risk-gradient
appliesTo:
  - "any extraction shooter with persistent gear across raids"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Loot value tiers with snowball caps

In an extraction shooter, the gear you bring INTO a raid is the gear you've earned by extracting in prior raids. This creates a positive-feedback loop that snowballs: good players accumulate gear, bring better gear next raid, get more loot, etc.

Two design knobs prevent the snowball from breaking the game:

1. **Tiered loot with rare top-tier**: most loot is mid-tier; the best stuff drops at ~5% so players still extract for the thrill of "maybe this raid is the one." This keeps mid-game players engaged.
2. **Secure containers / insurance**: a small portion of each player's gear is protected (secure slot) or refundable (insurance for cheap items). A single bad raid doesn't wipe progress.

## Implementation

```csharp
using UnityEngine;

public enum LootTier { Common, Uncommon, Rare, Legendary }

public class LootDrop : MonoBehaviour
{
    [SerializeField] private float commonChance = 0.60f;
    [SerializeField] private float uncommonChance = 0.30f;
    [SerializeField] private float rareChance = 0.08f;
    [SerializeField] private float legendaryChance = 0.02f;
    [SerializeField] private int secureSlotCount = 2;

    public LootTier RollTier(float roll01)
    {
        if (roll01 < legendaryChance) return LootTier.Legendary;
        if (roll01 < legendaryChance + rareChance) return LootTier.Rare;
        if (roll01 < legendaryChance + rareChance + uncommonChance) return LootTier.Uncommon;
        return LootTier.Common;
    }

    public bool IsSecureSlot(int slotIndex)
    {
        return slotIndex < secureSlotCount;
    }
}
```

## Avoid

- Flat distribution across tiers — top-tier loot is no longer special; mid-game players have nothing to chase.
- No secure slot — a single death wipes a player's entire kit; new players quit after one bad raid.
- Insurance covers everything — defeats the "full-loot" tension that drives the gameplay loop.
- Legendary chance > 10% — top-tier feels common, "legendary" becomes meaningless.

## Gotchas

- Drop rates should sum to ~1.0; verify with an assertion or rebalance script.
- Secure slot count interacts with map difficulty: easier maps → smaller secure slot.
- Insurance turnaround time matters: too fast (instant) = no risk; too slow (24hr) = the lost gear isn't really insured.
