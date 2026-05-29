---
id: relic-stacking-readability
category: game-design-deckbuilder
title: Keep stacked relic effects legible to the player
description: Design passive items (relics, artifacts, perks) so the *combined* effect of multiple stacked relics is still legible. Use explicit hook names and limit per-relic effect count.
useCases:
  - "design relics for a roguelite"
  - "make stacked passive effects readable"
  - "Slay the Spire relic design"
  - "limit number of effects per relic"
  - "tooltip clarity for permanent items"
tags: [deckbuilder, readability, quality-of-life]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Keep stacked relic effects legible

A deckbuilder's relic system is its passive synergy layer — and its biggest readability risk. By Act 3 a player may have 12 stacked relics, each with one or more triggers. If those triggers are arbitrary, the player can no longer predict what their deck does, and the game devolves into watching numbers fly.

The fix is twofold:
1. **Each relic names its hook explicitly** (`OnTurnStart`, `OnDamageTaken`, `OnCardPlayed`).
2. **Cap effects per relic to 1** in most cases. Only build-defining "boss relics" should have 2.

This keeps any individual tooltip readable and makes the union of stacked effects predictable.

## Pattern

```csharp
using UnityEngine;

public enum RelicHook { OnTurnStart, OnDamageTaken, OnCardPlayed, OnRest, OnRoomCleared }

[CreateAssetMenu(fileName = "Relic", menuName = "Game/Relic")]
public class RelicData : ScriptableObject
{
    public string relicName;
    public RelicHook hook;
    [TextArea] public string tooltip;
    // Single effect by convention. Multi-effect relics are reserved for boss tier.
    public int effectMagnitude = 1;
}
```

## Avoid

- Untyped "do-anything" relics whose tooltip is a paragraph.
- Relics with 3+ effects each (the multi-card tooltip readability problem).
- Relics whose effect depends on another relic being equipped (combinatorial tooltip explosion).
- Silent triggers (effect happens, no visual cue or log entry). Players who can't see the trigger think the relic is broken.

## Gotchas

- Provide a UI panel that groups relics by `hook` — players read "what triggers on damage taken" much faster than reading 12 individual tooltips.
- Boss-tier relics with 2 effects should also have a downside (curse a card, take +5% damage). Pure upside escalates power creep.
- For relics that scale per-encounter (`+1 strength per enemy killed`), surface the current accumulated value in the tooltip at all times.
