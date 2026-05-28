---
id: tier-progression-value-curves
category: game-design-casual-merge-2
title: Tier progression value curves (exponential, not linear)
description: In merge-2 games each new tier requires merging 2 of the previous tier, so values must grow super-linearly (3-5x per tier) to make upgrades feel meaningful. Linear scaling produces a boring treadmill.
useCases:
  - "design merge game tier value progression"
  - "exponential item values in merge-2 puzzle game"
  - "calculate tier value using Mathf.Pow in Unity"
  - "Travel Town or Merge Mansion item chain balance"
  - "compute player tier from merge count"
relatedGuides: []
appliesTo:
  - "merge-2 games where items combine pairwise to form higher-tier items"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Tier progression value curves

In Travel Town and Merge Mansion, each item slot has a tier. Merging two tier-N items produces one tier-(N+1) item. If you use linear value scaling (tier 5 = 5× base), players quickly stop caring about merges because the jumps feel small. Exponential scaling (tier 5 = 3.5^5 ≈ 525× base) makes every merge exciting.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "MergeGame/MergeTierProgression")]
public class MergeTierProgression : ScriptableObject
{
    [SerializeField] private int maxTier = 12;
    [SerializeField] private float baseValue = 10f;
    [SerializeField] private float perTierValueMultiplier = 3.5f;

    /// Returns the coin/resource value of a single item at the given tier.
    public float ValueForTier(int tier)
    {
        return baseValue * Mathf.Pow(perTierValueMultiplier, tier);
    }

    /// Converts a raw merge count into an approximate tier using log base 2
    /// (every pair of same-tier items produces the next tier).
    public int TierFromMergeCount(int sameItemMerges)
    {
        return Mathf.FloorToInt(Mathf.Log(sameItemMerges + 1, 2));
    }
}
```

## Avoid

- Linear value scaling (`baseValue * tier`) — the gap between tier 1 and tier 12 is only 12×; barely noticeable and not exciting.
- `perTierValueMultiplier <= 2` — at exactly ×2 per tier the curve is too gentle; ×3-5 is the Merge Mansion sweet spot.
- Very high multipliers (> 10×) — tier 12 value becomes astronomically large, breaking UI number formatting and economy balance.
- Skipping `maxTier` — without a cap, chain merges can exceed 64-bit integer limits if tier values overflow.

## Gotchas

- `Mathf.Pow` is floating-point — for display purposes, `Mathf.RoundToInt(ValueForTier(tier))` keeps UI clean.
- `TierFromMergeCount(0)` returns 0 (Mathf.Log(1, 2) = 0), which is correct — zero merges = tier 0 (starter item).
- When the board has items that were acquired without merging (purchased from shop), their tier is known directly; only use `TierFromMergeCount` for analytics or difficulty estimation.
- `maxTier` should match the asset catalog — if the game only has 10 art assets, set `maxTier = 10` so the code never tries to display tier 11.
</content>
