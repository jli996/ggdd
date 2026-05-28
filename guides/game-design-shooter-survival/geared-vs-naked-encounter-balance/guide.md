---
id: geared-vs-naked-encounter-balance
category: game-design-shooter-survival
title: Geared vs naked encounter balance (mitigate first-blood snowball)
description: In a survival shooter, a fully-geared player wiping a fresh spawn isn't fun for either side. Use damage-cap, geographic zoning, or risk-reward bias so geared players have incentive NOT to grief fresh spawns.
useCases:
  - "balance fresh spawn vs geared player in survival shooter"
  - "prevent griefing of new players"
  - "DayZ coastal player problem"
  - "loot value gating by zone"
  - "geographic gear tier zoning"
relatedGuides:
  - full-loot-economy-with-friction
appliesTo:
  - "any persistent-world shooter where gear disparity between players is large"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Geared vs naked encounter balance

A survival shooter's freshest spawns (naked, no weapons) and its top players (fully-geared) coexist on the same map. Without design intervention, a fully-geared player wandering through a fresh-spawn zone can wipe everyone for sport — fun for nobody, retention killer for newcomers.

Three mitigations (used together, not alone):

1. **Geographic zoning**: split the map into tiers. Low-tier zones have low-value loot — so geared players have no reason to hunt fresh spawns there. High-tier zones are dangerous and high-reward.
2. **Loot value bias toward risk**: best loot only spawns in highest-risk zones. Geared players go where the loot is, away from fresh spawns.
3. **Damage soft-cap on naked targets**: a top-tier weapon does the same damage to a naked target as a mid-tier weapon. Removes the "fun" of one-shot grief kills.

## Implementation

```csharp
using UnityEngine;

public enum ZoneTier { Coastal, MidInland, HighRisk }

public class EncounterBalance : MonoBehaviour
{
    [SerializeField] private float nakedDamageSoftCap = 30f;
    [SerializeField] private ZoneTier currentZone = ZoneTier.Coastal;

    public float ScaleDamageToTarget(float baseDamage, bool targetIsNaked)
    {
        if (targetIsNaked) return Mathf.Min(baseDamage, nakedDamageSoftCap);
        return baseDamage;
    }

    public float ZoneLootMultiplier()
    {
        return currentZone switch
        {
            ZoneTier.Coastal => 0.3f,
            ZoneTier.MidInland => 1.0f,
            ZoneTier.HighRisk => 2.5f,
            _ => 1.0f,
        };
    }
}
```

## Avoid

- Uniform loot distribution — geared players have no reason to leave the safe-loot zones, so they grief.
- No damage cap — a fresh spawn dies in one hit from any geared weapon.
- A "safe zone" with no PvP — turns into permanent griefer-staging; players AFK there. Tier the risk, don't remove it.

## Gotchas

- "Naked" detection should be lenient (any decent armor disqualifies); otherwise players exploit by stripping just before combat to invoke the soft-cap on themselves.
- Tier zones must be telegraphed clearly (map markers, UI, environmental cues) so players choose risk knowingly.
- Mid-tier zones are the most contested — design accordingly.
