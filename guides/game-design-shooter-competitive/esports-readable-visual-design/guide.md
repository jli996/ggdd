---
id: esports-readable-visual-design
category: game-design-shooter-competitive
title: Esports-readable visual design (silhouettes, kill-feed, observer mode)
description: Competitive shooters live or die by spectator clarity. Distinct silhouettes, high-contrast kill-feeds, and a usable observer mode determine whether broadcasts can build a community.
useCases:
  - "design for esports broadcasting"
  - "spectator readability in competitive shooter"
  - "kill-feed visual design"
  - "agent silhouette differentiation"
  - "observer mode UI"
relatedGuides: []
appliesTo:
  - "any competitive shooter with spectator / esports aspirations"
tags: [shooter, competitive-shooter, readability, pvp]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Esports-readable visual design

A competitive shooter that aspires to esports must answer: can a viewer who has never played the game follow the action? If not, the broadcast can't build an audience, and the meta-community starves.

Three pillars:
1. **Silhouette differentiation**: each agent's body shape (or color identity) is distinguishable at a glance, even from 100m.
2. **Kill-feed readability**: kill notifications use distinct iconography (weapon + headshot indicator), persist long enough to read.
3. **Observer mode**: free-cam with predictable controls, ability to follow any player, hide HUD chrome.

## Implementation

```csharp
using UnityEngine;

public class EsportsReadability : MonoBehaviour
{
    [SerializeField] private Color teamAColor = Color.cyan;
    [SerializeField] private Color teamBColor = Color.red;
    [SerializeField] private float killFeedPersistSeconds = 5f;
    [SerializeField] private bool observerModeEnabled = true;
    [SerializeField] private bool observerHidesHud = true;

    /// Minimum perceptual color distance between the two team colors (DeltaE76 simplified).
    public float TeamColorContrast()
    {
        return Vector3.Distance(
            new Vector3(teamAColor.r, teamAColor.g, teamAColor.b),
            new Vector3(teamBColor.r, teamBColor.g, teamBColor.b));
    }

    public bool IsKillFeedReadable() => killFeedPersistSeconds >= 3f && killFeedPersistSeconds <= 10f;

    public bool IsObserverModeReady() => observerModeEnabled && observerHidesHud;
}
```

## Avoid

- Same/similar team colors — viewers can't tell teams apart, broadcasts become incoherent.
- Kill feed that persists <3s — viewers can't read who killed whom in fast action.
- Observer mode without HUD-hide — broadcasts have to use third-party overlays.
- Agent silhouettes that share the same outline at distance — viewers misidentify, leading to wrong-strategy reads.

## Gotchas

- "Team color" can't be the SAME hue across maps (every map has team A always-blue). Allow per-map color overrides if needed for visibility against backgrounds.
- Kill-feed icons need outlines / drop-shadows so they read on bright AND dark backgrounds.
- Observer mode should support tournament-grade features: replay scrubbing, multi-player picture-in-picture, ability to spec dead players.
