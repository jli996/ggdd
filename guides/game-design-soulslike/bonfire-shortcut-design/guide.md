---
id: bonfire-shortcut-design
category: game-design-soulslike
title: Bonfire and shortcut design — reducing travel cost after clearing content
description: Checkpoints (bonfires) are rare and meaningful in a soulslike. Shortcuts reward exploration by creating fast paths back to recently-cleared areas. The discovery of a shortcut is its own victory moment — "I can now reach that bonfire in 20 seconds instead of 3 minutes."
useCases:
  - "Dark Souls bonfire placement design"
  - "soulslike checkpoint shortcut system"
  - "level design shortcut unlock"
  - "exploration reward via shortcuts"
  - "interconnected world navigation design"
relatedGuides:
  - stamina-economy
  - readable-attack-telegraphs
appliesTo:
  - "any soulslike or Metroidvania-style game where checkpoints are sparse and world navigation matters"
tags: [action, soulslike, progression, pacing, quality-of-life]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Bonfire and shortcut design

Dark Souls 1's Undead Burg → Firelink Shrine elevator is one of game design's finest moments. The player has fought through the entire Undead Burg. They find an elevator. They ride it. They're back at the starting bonfire in 10 seconds. The shortcut is the reward.

Two structural ideas:
1. **Bonfires are rare** — you earn the right to use them by clearing the content between them. Placing a bonfire too generously removes the fear of death.
2. **Shortcuts reduce travel, not challenge** — a shortcut doesn't skip the boss; it skips the walk back to the boss. The player still needs to defeat it.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "BonfireShortcut", menuName = "Game/Bonfire Shortcut")]
public class BonfireShortcut : ScriptableObject
{
    [System.Serializable]
    public class Bonfire
    {
        public string id;
        public string displayName;
        public string[] unlockShortcuts;  // shortcut IDs unlocked when this bonfire is lit
    }

    [System.Serializable]
    public class Shortcut
    {
        public string shortcutId;
        public string fromBonfireId;
        public string toBonfireId;
        public bool twoWay;  // true = unlocks travel in both directions
    }

    public Bonfire[] bonfires;
    public Shortcut[] shortcuts;

    public bool IsUnlockedShortcut(string shortcutId)
    {
        if (shortcuts == null || bonfires == null) return false;
        foreach (var bonfire in bonfires)
        {
            if (bonfire.unlockShortcuts == null) continue;
            foreach (var id in bonfire.unlockShortcuts)
            {
                if (id == shortcutId) return true;
            }
        }
        return false;
    }

    public Shortcut GetShortcut(string shortcutId)
    {
        if (shortcuts == null) return null;
        foreach (var s in shortcuts)
        {
            if (s.shortcutId == shortcutId) return s;
        }
        return null;
    }
}
```

## Avoid

- Shortcuts that skip required content (bosses, key items) — not a shortcut, a sequence break.
- More shortcuts than bonfires — the map becomes a rat's nest of connections with no clear topology.
- One-way shortcuts only — most players find the discovery less satisfying if they can't explore bidirectionally.

## Gotchas

- `twoWay = true` on a shortcut doesn't mean the shortcut is open from both ends at discovery — it means once unlocked, travel works both ways.
- `unlockShortcuts` on a `Bonfire` allows the designer to associate discoveries with specific bonfire rests (e.g. "light this bonfire → unlocks the elevator shortcut").
- `IsUnlockedShortcut` scans all bonfires — in a larger game, cache the unlocked shortcut set after each bonfire rest.
