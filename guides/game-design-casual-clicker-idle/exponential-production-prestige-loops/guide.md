---
id: exponential-production-prestige-loops
category: game-design-casual-clicker-idle
title: Exponential production & prestige loops (Cookie Clicker / AdVenture Capitalist)
description: Production doubles (or more) with each upgrade tier, creating explosive late-game numbers. Prestige resets the run for a meta-currency that boosts the next run 5-10x, making the reset feel like a reward rather than a punishment.
useCases:
  - "implement prestige system in idle clicker game"
  - "design exponential production scaling per upgrade tier"
  - "calculate prestige bonus multiplier from lifetime production"
  - "balance prestige reset reward in Cookie Clicker style game"
  - "add per-tier production multiplier with Mathf.Pow in Unity"
relatedGuides: []
appliesTo:
  - "clicker and idle games with upgrade tiers and prestige mechanics"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Exponential production & prestige loops

Cookie Clicker popularised the loop: buy upgrades → production explodes exponentially → eventually prestige (reset) for a bonus that makes the next run faster. AdVenture Capitalist refined it with distinct business tiers. The emotional hook is watching tiny per-second rates snowball into astronomical numbers, then *voluntarily* sacrificing them for a multiplier that makes the whole ride faster next time.

## Implementation

```csharp
using UnityEngine;

public class PrestigeSystem : MonoBehaviour
{
    [SerializeField] private float baseProduction = 1f;
    /// Each upgrade tier multiplies production by this factor. Must be > 1 for exponential growth.
    [SerializeField] private float perTierProductionMultiplier = 2f;
    /// Each prestige point adds this fraction to the production multiplier (0.10 = +10%).
    [SerializeField] private float prestigeBoostPerPoint = 0.10f;

    /// Production rate at a given tier with accumulated prestige points.
    /// Formula: base * multiplier^tier * (1 + points * boost)
    public float ProductionAtTier(int tier, int prestigePoints)
    {
        float tierBoost   = Mathf.Pow(perTierProductionMultiplier, tier);
        float prestigeMod = 1f + prestigePoints * prestigeBoostPerPoint;
        return baseProduction * tierBoost * prestigeMod;
    }

    /// Sqrt-scaled meta-currency so early prestiges still feel rewarding.
    public int PrestigePointsEarned(float totalLifetimeProduction)
    {
        return Mathf.FloorToInt(Mathf.Sqrt(totalLifetimeProduction / 1000f));
    }
}
```

## Avoid

- Linear production scaling — if tier N just adds a fixed amount, the late game feels completely flat. `Mathf.Pow` with a multiplier > 1 is essential.
- Prestige that merely resets without rewarding — players must feel the next run is meaningfully faster, not a punishment for playing too long.
- Setting `prestigeBoostPerPoint` so high that early prestige trivialises the game (> 0.5 per point) or so low it's imperceptible (< 0.02 per point).
- Omitting a production cap — without `maxTier` or a soft cap, floating-point overflow becomes a real bug at tier 150+; track as BigInteger or use logarithmic display.

## Gotchas

- Sqrt scaling for prestige points (not linear) prevents a "prestige inflation" cliff where the 10th prestige awards 10× the points of the 5th. Cookie Clicker uses `floor(sqrt(heavenlyChips))`.
- `perTierProductionMultiplier = 2f` doubles production per tier. At tier 20 that's ×1,048,576 — show formatted numbers ("1.0M cookies/s") immediately or players see meaningless digits.
- The prestige multiplier (`1 + points * boost`) compounds with the tier multiplier, which is intentional: prestige points should feel additive to the player but exponential in practice.
- Trigger prestige at a natural milestone (e.g., "you can now buy the most expensive upgrade" or "you've unlocked all tiers") so the reset decision is informed, not arbitrary.
</content>
