---
id: three-lane-geometry
category: game-design-casual-lane-switch
title: Three-lane geometry (snap movement, thumb-arc width, laneCount = 3 exactly)
description: Lane-switch games like Crowd City and Run Race 3D use exactly 3 lanes — the sweet spot for one-handed thumb-arc swipes. Lane switches snap instantly; the player is never caught floating between lanes.
useCases:
  - "implement 3-lane movement system for crowd runner game"
  - "add swipe-to-lane-switch controls in Crowd City style game"
  - "tune lane width for mobile thumb-arc comfort"
  - "snap player to lane on swipe in lane-switch casual game"
  - "validate 3-lane constraint in crowd accretion runner"
relatedGuides: []
appliesTo:
  - "lane-switch casual mobile games with swipe controls"
tags: [casual, lane-switch, mobile-first, one-tap, accessibility]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Three-lane geometry

Crowd City, Run Race 3D, and Stickman Boost all use exactly 3 lanes. Two lanes is too binary (no middle-ground option); four or more lanes requires cross-lane awareness that casual players find stressful. Three lanes maps perfectly to a single-thumb left/right swipe from any starting position. Lane switching must snap: floating (lerped) movement between lanes adds visual clarity but must resolve to a snap target within one frame so gameplay input is never ambiguous.

## Implementation

```csharp
using UnityEngine;

public class LaneController : MonoBehaviour
{
    [SerializeField] private int laneCount = 3;
    [SerializeField] private float laneWidthMeters = 2.5f;
    [SerializeField] private float swipeMinDistancePx = 50f;

    private int currentLane = 1;
    private int targetLane = 1;

    /// Snaps the target lane left or right based on swipe direction.
    public void OnSwipe(float deltaX)
    {
        if (Mathf.Abs(deltaX) < swipeMinDistancePx) return;
        if (deltaX < 0)
            targetLane = Mathf.Max(0, currentLane - 1);
        else
            targetLane = Mathf.Min(laneCount - 1, currentLane + 1);
        currentLane = targetLane;
    }

    /// Returns true only when laneCount is exactly 3 (the design constraint).
    public bool IsValidLaneCount()
    {
        return laneCount == 3;
    }
}
```

## Avoid

- Continuous horizontal movement without lane snapping — the player can be caught mid-lane during an obstacle approach, which feels unfair.
- More than 3 lanes — playtesting consistently shows 4+ lanes overwhelm casual players who don't want to plan multiple moves ahead.
- `laneWidthMeters < 1.5` — too narrow and crowd formations overlap visually; `> 4.0` and players must pan the camera to see side lanes.
- Ignoring `swipeMinDistancePx` — without a threshold, micro-jitter on cheap touch panels triggers unintended lane changes.

## Gotchas

- `currentLane` and `targetLane` are int indices [0, laneCount-1]; convert to world X position as `(lane - 1) * laneWidthMeters` (for 3 lanes: -2.5, 0, 2.5 with 2.5m width).
- `IsValidLaneCount()` is a design guard — call it in editor validation or `Awake` via `Debug.Assert(IsValidLaneCount())` to catch config mistakes early.
- Crowd formations (see companion guide) must receive `targetLane` immediately after `OnSwipe` so all units re-layout in the same frame as the swipe.
- Run Race 3D allows a double-swipe (two taps in quick succession) to jump two lanes; implement this as two consecutive `OnSwipe` calls with an input buffer, not a special case.
</content>
