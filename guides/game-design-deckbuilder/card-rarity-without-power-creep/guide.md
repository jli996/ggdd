---
id: card-rarity-without-power-creep
category: game-design-deckbuilder
title: Card rarity as effect breadth, not raw power
description: Use rarity to gate complexity and conditional power, not to scale raw numbers. Prevents the late-game "obvious correct pick" trap.
useCases:
  - "design card rarity tiers"
  - "avoid power creep in card games"
  - "common vs rare card design"
  - "balance deckbuilder card pools"
  - "build-defining rare cards"
relatedGuides:
  - run-pacing-3-act-structure
appliesTo:
  - "any deckbuilder with multiple rarity tiers"
tags: [deckbuilder, rarity-tiers, power-curve]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Card rarity as effect breadth, not raw power

The naive rarity model — "rare = bigger numbers" — degenerates into solved decks: in any deck, the rare cards are always correct picks, and the common cards become filler. The interesting model is **rarity as effect breadth**: commons do one clean thing; rares do *more things*, do conditional things, or change other cards' behavior.

The deck's identity should come from rares (build-defining synergies), but commons should remain mathematically competitive in their slot.

## Pattern

```csharp
using UnityEngine;

public enum CardRarity { Common, Uncommon, Rare }

[CreateAssetMenu(fileName = "Card", menuName = "Game/Card")]
public class CardData : ScriptableObject
{
    public string cardName;
    public CardRarity rarity = CardRarity.Common;
    public int energyCost = 1;
    public int baseDamage = 6;
    // Effects modify the card with conditionals / synergies (length grows with rarity).
    public string[] effects;
}
```

By convention:
- **Common**: 0–1 effects. Tight cost-to-value.
- **Uncommon**: 1–2 effects, often a small synergy hook ("if X, do Y").
- **Rare**: 2–3 effects, build-defining ("whenever you play a Skill, draw a card").

Notice: `baseDamage` need not scale with rarity. A common Strike at 6 damage may remain efficient cost-per-damage across the whole game.

## Avoid

- **Stat-only rarity ladders** (common = 6dmg, uncommon = 9dmg, rare = 12dmg). Solved decks: always pick the higher tier.
- **Rares that are strictly better than commons.** A rare should be *different*, not bigger.
- **Effects that snowball without cost.** Build-defining is good; "every other card I draw also draws a card" without a downside is not.

## Gotchas

- Test your common pool in isolation: a deck made of only commons should still complete an Act 1 boss. If commons can't carry a run, the rarity gradient is too steep.
- The `effects` array length growing with rarity is a useful invariant but only when the effects are *qualitatively* different (conditional, synergistic). Three trivial effects is worse than one good one.
- Card slots should fill faster than rares appear, so most decks have many commons. If rares come too fast, common cards become permanent dead weight.
