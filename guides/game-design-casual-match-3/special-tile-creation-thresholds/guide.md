---
id: special-tile-creation-thresholds
category: game-design-casual-match-3
title: Special tile creation thresholds (match shape to special type mapping)
description: Match-4 creates a line bomb, match-5 creates a color bomb, T/L shapes create explosions. Map match shape to special tile type in a data-driven way so designers can tune thresholds without touching code.
useCases:
  - "implement special tile creation rules for match-3 game"
  - "map match shape to special tile type"
  - "data-driven special tile thresholds in Candy Crush style game"
  - "add line bombs and color bombs to match-3 puzzle"
  - "design Royal Match special tile progression"
relatedGuides: []
appliesTo:
  - "match-3 puzzle games with special power-up tiles"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Special tile creation thresholds

Candy Crush and Royal Match teach players their special tile rules through play: match 4 in a line and a candy bomb appears, match 5 and a rainbow (color bomb) appears. The key is to make this mapping consistent, predictable, and telegraphed — players should be able to set up matches intentionally once they understand the system.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "Match3/SpecialTileFactory")]
public class SpecialTileFactory : ScriptableObject
{
    public enum SpecialTileType { None, LineBomb, ColorBomb, Explosion }

    public enum MatchShape
    {
        Linear3,
        Linear4,
        Linear5,
        TShape,
        LShape,
        Square2x2
    }

    [System.Serializable]
    public class SpecialThreshold
    {
        public MatchShape shape;
        public SpecialTileType creates;
    }

    [SerializeField] private SpecialThreshold[] thresholds = new SpecialThreshold[]
    {
        new SpecialThreshold { shape = MatchShape.Linear4, creates = SpecialTileType.LineBomb },
        new SpecialThreshold { shape = MatchShape.Linear5, creates = SpecialTileType.ColorBomb },
        new SpecialThreshold { shape = MatchShape.TShape,  creates = SpecialTileType.Explosion },
        new SpecialThreshold { shape = MatchShape.LShape,  creates = SpecialTileType.Explosion },
    };

    /// Returns the special tile type created by the given match shape.
    public SpecialTileType WhatDoesShapeCreate(MatchShape shape)
    {
        foreach (var t in thresholds)
        {
            if (t.shape == shape) return t.creates;
        }
        return SpecialTileType.None;
    }
}
```

## Avoid

- Hard-coding match rules in game logic rather than data — when a designer wants to swap Linear4 from LineBomb to Explosion for a special event, they should edit a ScriptableObject, not a C# file.
- Creating the same special type for every match shape — the mapping only has educational value if each shape produces a distinct result.
- Allowing shapes with no entry to crash — always return `SpecialTileType.None` as a safe default.

## Gotchas

- T-shape and L-shape detection requires tracking the orientation of the match group, not just the count. Ensure the match-detection subsystem flags shape before calling `WhatDoesShapeCreate`.
- Square2x2 (2×2 block) is a rarer pattern but creates a powerful area-clear in games like Royal Match — include it in the factory even if disabled by leaving it out of the thresholds array initially.
- Parallel special tile explosions (color bomb hitting a line bomb) can cascade unpredictably. Clamp cascade depth using the `MatchCascade` guard from the companion guide.
- `thresholds` is ordered — if a shape matches multiple entries (shouldn't happen in a well-designed mapping), the first match wins.
</content>
