---
id: asymmetric-session-length-design
category: game-design-shooter-extraction
title: Asymmetric session-length design (short raids vs long raids)
description: Extraction shooters attract two distinct player segments — quick-session (15min) and long-session (60-90min). Design raid maps and timers so both audiences are served by the same content.
useCases:
  - "design raid length for extraction shooter"
  - "support different session lengths"
  - "raid timer tuning"
  - "Tarkov raid length variety"
  - "match player session duration to map"
relatedGuides: []
appliesTo:
  - "any extraction shooter with multiple maps or configurable raid timers"
tags: [shooter, extraction-shooter, pacing, accessibility]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Asymmetric session-length design

Extraction shooters serve two distinct player segments at once:
- **Short-session players** (15-25min raids): playing on lunch break, between meetings, casual play.
- **Long-session players** (60-90min raids): playing a "session," exploring map deeply, treasure-hunting.

Forcing one map onto both creates problems: long raids feel punishing to short-session players (no time to extract); short raids feel shallow to long-session players (just rush extract).

The fix is **map-tier diversity**: maintain a portfolio of maps with different raid timers, so a player can pick what fits their available time.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "RaidConfig", menuName = "Game/Raid Config")]
public class RaidConfig : ScriptableObject
{
    [System.Serializable]
    public class MapTier
    {
        public string mapName;
        public float raidDurationMinutes;
        public int playerCount;
    }

    public MapTier shortRaid = new MapTier
    {
        mapName = "Customs",
        raidDurationMinutes = 20f,
        playerCount = 8,
    };

    public MapTier mediumRaid = new MapTier
    {
        mapName = "Woods",
        raidDurationMinutes = 40f,
        playerCount = 10,
    };

    public MapTier longRaid = new MapTier
    {
        mapName = "Streets",
        raidDurationMinutes = 75f,
        playerCount = 14,
    };
}
```

## Avoid

- All maps with the same timer — alienates one player segment entirely.
- Player-configurable raid timer (slider) — sounds good but destroys map balance (a 15min raid on a 60min-tuned map is just a deathmatch).
- Long raids without "early extract" — long-session players need the option to bail out 30min in if real life calls.

## Gotchas

- Player count should scale with raid duration roughly — longer raids accommodate more players because there's more spatial elbow room.
- Loot density on long maps should NOT scale 1:1 with duration; otherwise long raids are strictly better. Tune at ~70% rate to make short raids competitive per minute.
- Server matching should respect tier preference (don't drop a 20min-tier player into a 75min-tier queue).
