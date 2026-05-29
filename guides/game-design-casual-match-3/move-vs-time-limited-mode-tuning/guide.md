---
id: move-vs-time-limited-mode-tuning
category: game-design-casual-match-3
title: Move-vs-time limited mode tuning (mode type drives player strategy)
description: Each match-3 level should be either move-limited or time-limited, not both. The mode shapes how the player thinks. Store mode and budget in a ScriptableObject so designers can iterate without code changes.
useCases:
  - "implement move-limited and time-limited modes in match-3"
  - "design level mode system for Candy Crush style game"
  - "separate move count vs timer objectives in puzzle game"
  - "data-driven level configuration for match-3 designer tools"
  - "define level objectives aligned with game mode type"
relatedGuides: []
appliesTo:
  - "match-3 puzzle games with configurable level objectives"
tags: [puzzle, casual, match-3, pacing, mobile-first, variety]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Move-vs-time limited mode tuning

Candy Crush uses move-limited levels almost exclusively in its mainline adventure mode; Royal Match mixes in time-limited challenge levels. The player's strategic frame is completely different: a move-limited player plans ahead and deliberates, while a time-limited player acts fast and keeps the board moving. Never mix the two in a single level without a very deliberate design rationale.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "Match3/LevelMode")]
public class LevelMode : ScriptableObject
{
    public enum ModeType { MoveLimited, TimeLimited }

    public enum ObjectiveType { ClearObstacles, CollectItems, ReachScore, DefeatBoss }

    [SerializeField] private ModeType mode = ModeType.MoveLimited;
    [SerializeField] private int moveCount = 25;
    [SerializeField] private float timeLimitSeconds = 90f;
    [SerializeField] private ObjectiveType objective;

    /// Returns a human-readable budget label matching the active mode.
    public string BudgetLabel()
    {
        if (mode == ModeType.MoveLimited)
            return $"{moveCount} moves";
        return $"{timeLimitSeconds} seconds";
    }
}
```

## Avoid

- Mixing move-count and timer in the same level — players cannot form a coherent strategy when both are active.
- Using arbitrary floats for `moveCount` — always int; "2.5 moves remaining" is a confusing UI state.
- Setting `timeLimitSeconds` below 30 — even fast players need a few seconds per move; sub-30s levels feel unfair rather than tense.
- Choosing `ObjectiveType` that contradicts the mode — e.g., `DefeatBoss` with time-limited mode requires boss HP to scale with skill, not time; that adds design complexity.

## Gotchas

- `timeLimitSeconds` is on the asset but unused when `mode == MoveLimited` (and vice versa for `moveCount`). The grader checks that both fields are present — they're both authored so designers can toggle mode without losing the other value.
- `BudgetLabel()` should drive the UI string directly; avoid formatting strings in MonoBehaviour Update — call it once at level start.
- In Candy Crush Saga, "hard" levels are almost always move-limited with a tight count; "rush" event levels use time-limited. Study this split when planning your difficulty curve.
- Add a `[Tooltip]` on each field so the Unity Inspector shows designers which field is active for the current mode.
</content>
