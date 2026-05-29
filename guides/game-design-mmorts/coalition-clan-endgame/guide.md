---
id: coalition-clan-endgame
category: game-design-mmorts
title: Coalition and clan endgame (solo cap, clan-only content)
description: Solo progression caps out at a meaningful level; deep endgame content (joint attacks, shared resources, clan leaderboards) requires clan participation. Clan size bonuses scale multipliers to incentivize larger cooperative groups.
useCases:
  - "design mmorts clan and guild endgame system"
  - "solo progression cap with clan-only endgame"
  - "coalition mechanics in mobile strategy game"
  - "clan size bonus multiplier design"
  - "guild participation incentive design"
relatedGuides: []
appliesTo:
  - "any MMORTS or multiplayer strategy game with guild/clan progression systems"
tags: [strategy, mmorts, coop, progression]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Coalition and clan endgame

A healthy MMORTS retains solo players through mid-game, then funnels them into clans for endgame content. The solo progression cap (e.g., level 50) is achievable alone; the true max (e.g., level 100) requires clan participation for joint attacks, tech sharing, and shared resource pools. Clan size bonuses scale rewards with group size.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "GGDD/ClanSystem")]
public class ClanSystem : ScriptableObject
{
    [System.Serializable]
    public class ClanBonus
    {
        public int clanSize;
        public float bonusMultiplier;
    }

    [SerializeField] private int soloProgressionCap = 50;
    [SerializeField] private int clanMaxLevel = 100;
    [SerializeField] private ClanBonus[] bonuses;

    public int MaxAchievableLevel(bool inClan)
    {
        return inClan ? clanMaxLevel : soloProgressionCap;
    }
}
```

## Avoid

- `soloProgressionCap == clanMaxLevel` — solo players have no reason to join a clan.
- No clan size bonuses — large clans offer no systemic advantage over small ones.
- Clan max level unreachably high — if the gap is too large, solo players feel left out; aim for a 2x ratio.
- `bonusMultiplier` of 1.0 for all clan sizes — removes the incentive to recruit more members.

## Gotchas

- `[System.Serializable]` on `ClanBonus` is required for Unity Inspector display.
- `ClanBonus[]` should be sorted ascending by `clanSize` for readability, though the lookup doesn't depend on order.
- `MaxAchievableLevel` should be simple and clear — it's called frequently by UI systems to gating content access.
- Clan join/leave should not immediately change a player's progress cap — apply a cooldown to prevent abuse.
