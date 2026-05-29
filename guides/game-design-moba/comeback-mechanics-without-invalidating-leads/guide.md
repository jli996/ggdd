---
id: comeback-mechanics-without-invalidating-leads
category: game-design-moba
title: Comeback mechanics without invalidating leads (bounties, neutral objectives)
description: Bounty systems and scaled neutral objectives let losing teams catch up without making a 5k gold lead meaningless. Cap bounties and objective boosts to preserve the value of skilled play while keeping matches competitive.
useCases:
  - "design moba comeback bounty system"
  - "balance gold lead vs comeback potential in moba"
  - "neutral objective scaling with gold deficit"
  - "prevent snowball in moba without removing leads"
  - "bounty cap design for competitive integrity"
relatedGuides: []
appliesTo:
  - "any MOBA or team-based game with gold income and neutral objectives"
tags: [strategy, moba, economy, cap-and-decay, pvp]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Comeback mechanics without invalidating leads

Comeback mechanics are necessary for watchability and player retention — a 10k gold lead that ends the game in 5 minutes is unplayable. But uncapped bounties that make being behind a dominant strategy destroy competitive integrity. The solution: scale bounties with deficit, cap them meaningfully, and apply the same logic to neutral objectives.

## Implementation

```csharp
using UnityEngine;

public class ComebackMechanic : MonoBehaviour
{
    [SerializeField] private float baseBountyGold = 300f;
    [SerializeField] private float bountyScalingPerKgoldDeficit = 80f;
    [SerializeField] private float maxBountyGold = 1200f;
    [SerializeField] private float neutralObjectiveBoostMaxPercent = 0.30f;

    /// Returns kill bounty gold for the losing team's killer, capped at maxBountyGold.
    public float BountyForKill(float losingTeamGold, float winningTeamGold)
    {
        float deficitKGold = Mathf.Max(0f, (winningTeamGold - losingTeamGold) / 1000f);
        float bounty = baseBountyGold + bountyScalingPerKgoldDeficit * deficitKGold;
        return Mathf.Min(bounty, maxBountyGold);
    }
}
```

## Avoid

- Fixed bounty regardless of deficit — no comeback potential; games decided early.
- Uncapped bounty — losing team earns more per kill than winning team; inverts incentives.
- `neutralObjectiveBoostMaxPercent` above 0.5 — a 50%+ boost makes objectives game-deciding on their own.
- Very high `baseBountyGold` — the bounty system should not grant a comeback from even scores; it should only kick in on a real deficit.

## Gotchas

- `maxBountyGold > baseBountyGold` is required — if the cap equals the base, scaling never applies.
- `Mathf.Min` is the correct Unity idiom for capping; don't use ternaries for this.
- Deficit should be measured in gold units with a reasonable sensitivity — `80f per 1k gold deficit` is a tuning starting point.
- Neutral objective scaling should be a separate multiplier on the objective's base value, not a flat gold bonus — so it scales appropriately across map sizes.
