---
id: partial-pour-rules
category: game-design-casual-color-sort
title: Partial pour rules (color match, capacity, and contiguous-top-run logic)
description: Water Sort pours only if the destination is empty or the top color matches. Pour fills from the bottom, and only the contiguous same-color run at the top of the source pours. Encode these as deterministic rules so the puzzle engine is predictable.
useCases:
  - "implement water pour rules for Water Sort style game"
  - "code color-matching pour logic for bottle puzzle"
  - "handle partial pours based on contiguous color run"
  - "validate pour eligibility between two bottles"
  - "calculate how many color units transfer in Ball Sort puzzle"
relatedGuides: []
appliesTo:
  - "color-sort and liquid-sort puzzle games with bottle mechanics"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Partial pour rules

Water Sort Puzzle and Ball Sort Puzzle share the same core mechanic: you can pour from bottle A to bottle B only if the top color in A matches the top color in B (or B is empty), and B has room. Critically, you pour the entire contiguous same-color run from the top of A — not just one unit. This "partial pour" rule is what creates the strategic depth.

## Implementation

```csharp
using UnityEngine;

public class BottlePour : MonoBehaviour
{
    [SerializeField] private int bottleCapacity = 4;

    /// Returns true if a pour from src to dst is legal.
    /// dstFillCount: how many units are already in dst.
    /// topColorSrc / topColorDst: color IDs at the top of each bottle (-1 if empty).
    public bool CanPour(int topColorSrc, int topColorDst, int dstFillCount)
    {
        if (topColorSrc < 0) return false;
        if (dstFillCount >= bottleCapacity) return false;
        if (dstFillCount == 0) return true;
        return topColorSrc == topColorDst;
    }

    /// Returns how many color units will pour from src to dst.
    /// srcTopRun: number of same-color units at the top of src.
    /// dstCount: current fill in dst.
    public int HowMuchPours(int srcCount, int dstCount, int srcTopRun)
    {
        int dstSpace = bottleCapacity - dstCount;
        return Mathf.Min(srcTopRun, dstSpace);
    }
}
```

## Avoid

- Allowing any pour regardless of color match — the puzzle loses all challenge if mismatched colors can stack.
- Pouring one unit at a time instead of the full contiguous run — this makes the puzzle tediously long and breaks the "aha" moment when a full color block lands.
- Letting dst overflow beyond capacity — always compute `dstSpace` before transferring units.

## Gotchas

- `-1` (or a sentinel) for "empty bottle" avoids allocating a real color ID for empty; ensure your color ID scheme reserves this value.
- `srcTopRun` must be computed by scanning from the top of the source stack downward until the color changes — it is not the same as `srcCount`.
- In Water Sort Puzzle the pour animation is continuous; the game engine should use `HowMuchPours` to know the final state before the animation starts, so it can play correctly even if interrupted.
- Bottles with capacity 4 are the standard in Water Sort; Ball Sort uses exactly 4 balls per tube. Consider making `bottleCapacity` a designer-tunable field as done above.
</content>
