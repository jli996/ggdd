---
id: round-based-economy-reset
category: game-design-shooter-competitive
title: Round-based economy reset (CS-style buy phase)
description: In a round-based competitive shooter, money/utility resets (partially) per round. Tune reset rules to prevent runaway snowball while still rewarding round wins meaningfully.
useCases:
  - "design buy phase in competitive shooter"
  - "round economy in Counter-Strike style game"
  - "force buy vs eco round design"
  - "loss bonus tuning"
  - "money reset between rounds"
relatedGuides: []
appliesTo:
  - "any round-based competitive shooter with weapon-purchase economy"
tags: [shooter, competitive-shooter, economy, pvp]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Round-based economy reset

In CS-style games, players don't earn gear permanently — they buy it each round using money earned from prior rounds. The economy creates strategic depth: a team on a losing streak gets bigger "loss bonuses" to enable a force-buy.

Design knobs:
1. **Round-end bonus tiers**: win pays well, loss pays less (but escalates on losing streaks).
2. **Per-kill reward**: small per-kill payout to reward engagement even on losing rounds.
3. **Money cap**: rich players have limited surplus; can't hoard infinitely.

## Implementation

```csharp
using UnityEngine;

public class EconomySystem : MonoBehaviour
{
    [SerializeField] private int startingMoney = 800;
    [SerializeField] private int winBonus = 3250;
    [SerializeField] private int baseLossBonus = 1400;
    [SerializeField] private int lossStreakIncrement = 500;
    [SerializeField] private int maxLossBonus = 3400;
    [SerializeField] private int killReward = 300;
    [SerializeField] private int moneyCap = 16000;

    public int LossBonusForStreak(int consecutiveLosses)
    {
        int bonus = baseLossBonus + Mathf.Max(0, consecutiveLosses - 1) * lossStreakIncrement;
        return Mathf.Min(bonus, maxLossBonus);
    }

    public int AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)
    {
        int reward = wonRound ? winBonus : LossBonusForStreak(consecutiveLosses);
        reward += kills * killReward;
        return Mathf.Min(currentMoney + reward, moneyCap);
    }
}
```

## Avoid

- No money cap — top teams hoard, force-buy becomes irrelevant (they always have cash).
- No loss bonus — a team on a losing streak can't afford gear, snowballs into 16-0 stomp.
- Loss bonus > win bonus — sandbags incentivize losing rounds for the larger payout.
- Per-kill reward larger than round bonus — undermines the round-as-unit-of-play principle.

## Gotchas

- Loss-streak bonus should reset on a win (otherwise teams that occasionally win still accumulate "loss benefits").
- Starting money calibration matters: too high → first-round full buy, no eco; too low → first round is always a save.
- Match the cap to typical full-buy cost × 1.3 — too high and players can stockpile for late-game super-buys; too low and a frugal player has nothing to spend money on.
