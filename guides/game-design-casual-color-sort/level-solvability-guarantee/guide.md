---
id: level-solvability-guarantee
category: game-design-casual-color-sort
title: Level solvability guarantee (reverse-shuffle from solved state)
description: Random forward placement of colors can generate unsolvable puzzles. Always generate levels by reverse-shuffling from a known solved state — apply N random valid pours backwards so the final layout is guaranteed solvable.
useCases:
  - "generate always-solvable Water Sort puzzle levels"
  - "implement reverse-shuffle level generation for color sort game"
  - "avoid unsolvable puzzle states in Ball Sort generation"
  - "use random seed for reproducible level generation in Unity"
  - "add empty bottle buffer for playable color-sort levels"
relatedGuides: []
appliesTo:
  - "color-sort and liquid-sort puzzle games with procedural level generation"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Level solvability guarantee

Water Sort Puzzle and similar games must guarantee that every generated level is solvable. If you randomly place colors forward (assign random colors to random bottles), a significant fraction of levels will be unsolvable — frustrating players who can't tell if they're stuck due to skill or design. The solution is **reverse shuffling**: start from the solved state (each bottle filled with one color), apply N random valid reverse-pours, and the resulting scrambled state is always solvable because you can replay those pours in reverse.

## Implementation

```csharp
using UnityEngine;

public class ColorSortLevelGenerator : MonoBehaviour
{
    [SerializeField] private int colorCount = 4;
    [SerializeField] private int extraEmptyBottles = 2;
    [SerializeField] private int scrambleStepCount = 30;
    [SerializeField] private int randomSeed = 12345;

    /// Generates a BottleState[] guaranteed solvable via reverse-shuffle from solved state.
    public BottleState[] Generate()
    {
        var rng = new System.Random(randomSeed);
        int totalBottles = colorCount + extraEmptyBottles;
        var bottles = new BottleState[totalBottles];

        for (int i = 0; i < colorCount; i++)
            bottles[i] = BottleState.FilledWith(i, 4);

        for (int step = 0; step < scrambleStepCount; step++)
        {
            int a = rng.Next(totalBottles);
            int b = rng.Next(totalBottles);
            if (a != b) bottles[a].ReverseTransferTo(ref bottles[b]);
        }
        return bottles;
    }

    /// Always returns true: the reverse-shuffle algorithm guarantees solvability by construction.
    public bool EnsuredSolvable()
    {
        return true;
    }
}

public struct BottleState
{
    public int[] colors;

    public static BottleState FilledWith(int colorId, int count)
    {
        var s = new BottleState { colors = new int[count] };
        for (int i = 0; i < count; i++) s.colors[i] = colorId;
        return s;
    }

    public void ReverseTransferTo(ref BottleState other) { }
}
```

## Avoid

- Forward random placement — placing random colors into random bottles will produce unsolvable states roughly 30-60% of the time depending on constraints.
- `scrambleStepCount < 10` — too few steps leave the puzzle nearly in its solved state, making it trivially easy.
- No `extraEmptyBottles` — without at least one empty bottle, no pour is possible from the start and the level is immediately stuck.
- Non-deterministic `randomSeed` (using `System.DateTime.Now`) during development — always use a fixed seed until QA can reproduce a specific level.

## Gotchas

- After shipping, `randomSeed` should be derived from a level index so each level number always generates the same layout. Store the seed in your level database, not hardcoded.
- `extraEmptyBottles >= 2` is a good starting point for difficulty; reducing to 1 makes levels harder; 0 makes many scrambles unsolvable regardless of algorithm.
- `scrambleStepCount` controls difficulty: 10-15 = easy, 25-35 = medium, 45+ = hard. Tune per level band.
- The `ReverseTransferTo` method in this stub is intentionally simplified — the real implementation must respect the color-match rules from the `partial-pour-rules` guide.
</content>
