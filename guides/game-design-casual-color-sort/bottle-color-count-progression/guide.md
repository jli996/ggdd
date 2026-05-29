---
id: bottle-color-count-progression
category: game-design-casual-color-sort
title: Bottle color count progression (one dimension at a time)
description: Difficulty in color-sort games should increase by adjusting one variable per level — either bottle count, color count, or empty bottle count — never all at once. Store progression as a data array so designers can tune without code.
useCases:
  - "design difficulty progression for Water Sort puzzle game"
  - "incrementally increase color count in bottle sort game"
  - "validate that only one difficulty parameter changes per level"
  - "data-driven level difficulty config for color sort game"
  - "prevent difficulty spikes in Ball Sort Puzzle progression"
relatedGuides: []
appliesTo:
  - "color-sort and liquid-sort puzzle games with multi-level progression"
tags: [puzzle, casual, color-sort, progression, accessibility, mobile-first]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Bottle color count progression

Water Sort Puzzle starts simple: 4 colors, 6 bottles (4 filled + 2 empty). Over hundreds of levels it introduces more colors, fewer empty bottles, or more bottles with the same colors. The key insight is to change only one dimension at a time — players need one session to adapt to a new rule before you add another. Changing color count AND bottle count simultaneously creates opaque difficulty spikes.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "ColorSort/ColorSortDifficulty")]
public class ColorSortDifficulty : ScriptableObject
{
    [System.Serializable]
    public class LevelDifficulty
    {
        public int levelNumber;
        public int colorCount;
        public int bottleCount;
        public int extraEmpty;
    }

    [SerializeField] private LevelDifficulty[] levels;

    /// Returns true only if each consecutive level pair changes AT MOST ONE parameter.
    public bool IsValidProgression()
    {
        for (int i = 1; i < levels.Length; i++)
        {
            var prev = levels[i - 1];
            var curr = levels[i];
            int changes = 0;
            if (prev.colorCount  != curr.colorCount)  changes++;
            if (prev.bottleCount != curr.bottleCount) changes++;
            if (prev.extraEmpty  != curr.extraEmpty)  changes++;
            if (changes > 1) return false;
        }
        return true;
    }
}
```

## Avoid

- Increasing color count, bottle count, and reducing empty bottles all in the same level — players have no framework for which change made the level harder.
- Linear or fixed step sizes for all three parameters — not every dimension has the same difficulty impact; tune each independently.
- Very large jumps in a single dimension (e.g., +5 colors between levels) — gradual increases retain players; big spikes cause churn.

## Gotchas

- `IsValidProgression()` is a designer validation tool — call it in the Unity Editor (e.g., via a custom inspector button or `OnValidate`) rather than at runtime.
- `extraEmpty = 1` is a significant difficulty increase compared to `extraEmpty = 2`; treat it as its own dimension separate from bottle count.
- Levels 1-20 should keep `colorCount` constant (4) and focus on teaching the pour mechanic; introduce a 5th color only around level 20-30.
- Ball Sort Puzzle uses exactly 4 balls per tube and follows this one-dimension-at-a-time rule strictly, which is part of why its difficulty curve is smooth and retention is high.
</content>
