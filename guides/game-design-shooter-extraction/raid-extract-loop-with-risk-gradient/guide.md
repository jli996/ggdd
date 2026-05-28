---
id: raid-extract-loop-with-risk-gradient
category: game-design-shooter-extraction
title: Raid + extract loop with risk gradient
description: In an extraction shooter, the extraction itself IS the gameplay climax. Telegraph zones, contest them with timing, and weight reward by distance/risk so extraction is a meaningful decision, not a formality.
useCases:
  - "design extraction zones in extraction shooter"
  - "Tarkov style extract design"
  - "Hunt: Showdown extraction gameplay"
  - "risk gradient for raid extraction"
  - "contested extract spawn timing"
relatedGuides: []
appliesTo:
  - "any extraction shooter where players raid, fight, and choose when/where to leave"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Raid + extract loop with risk gradient

The extraction is the gameplay climax in extraction shooters. The decision tree at extract — *Which zone? Now or wait? Risk a fight or detour?* — is the most important decision the player makes in the raid.

Design principles:
1. **Multiple zones, distinct risk/reward**: close-to-spawn extracts are safe but slow to reach; deep extracts are dangerous but pay better (XP/loot multiplier).
2. **Telegraph + delay**: zones broadcast their open status (radio chatter, smoke flare). The opening window is finite so players race to it.
3. **Contested by design**: zones should cluster naturally with other extracts or with PvE objectives, so the same area is approached by multiple players.

## Implementation

```csharp
using UnityEngine;

public class ExtractionZone : MonoBehaviour
{
    [SerializeField] private float openWindowSeconds = 90f;
    [SerializeField] private float distanceFromSpawn = 500f;
    [SerializeField] private float lootRewardMultiplier = 1f;
    private float windowStartedAt = -1f;

    public bool IsOpen => windowStartedAt >= 0f && Time.time - windowStartedAt < openWindowSeconds;

    public void Open()
    {
        windowStartedAt = Time.time;
        // Telegraph: trigger smoke flare, radio chatter, etc.
    }

    /// Reward scales with distance from spawn (geographic risk).
    public float RewardForExtract(float baseLoot)
    {
        float distanceBias = Mathf.Clamp01(distanceFromSpawn / 1000f);
        return baseLoot * (lootRewardMultiplier + distanceBias);
    }
}
```

## Avoid

- Single extract zone — turns into a deathmatch funnel; no decision-making.
- All zones with equal reward — players take the easiest, the rest are wasted content.
- Always-open zones — destroys the "race against the timer" tension.
- Silent zones (no telegraph) — players can't plan; the system devolves into camping.

## Gotchas

- The extract zone's open window should be short enough to feel urgent (60-120s typically) but long enough that a player far from the zone can sprint there if they commit immediately.
- Loot multiplier should reward distance but not so harshly that the closest extract is never worth it for low-loot raids.
- Sound design IS gameplay: the extract telegraph should be audible from a meaningful range (sound cone, not just visual).
