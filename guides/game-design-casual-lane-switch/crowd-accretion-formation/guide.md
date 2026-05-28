---
id: crowd-accretion-formation
category: game-design-casual-lane-switch
title: Crowd accretion formation (V, Line, Square, Circle layouts)
description: In crowd-runner games like Crowd City and Run Race 3D, collecting NPCs scales the crowd. The crowd must move as a coherent formation (line, V, square, circle) so the player reads unit count as strategic advantage, not visual chaos.
useCases:
  - "implement crowd formation system for Crowd City style game"
  - "add and remove units from crowd formation in runner game"
  - "compute formation positions for V, line, square, circle layouts"
  - "scale crowd size visually in lane-switch casual game"
  - "layout NPC crowd coherently based on unit count in Unity"
relatedGuides: []
appliesTo:
  - "lane-switch crowd-runner games with collectible NPC units"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Crowd accretion formation

Crowd City's core mechanic is that your crowd grows as you absorb neutral NPCs and shrinks when opponents absorb yours. The emotional impact depends entirely on the crowd reading as a coherent mass — players must instantly perceive relative crowd size at a glance. Formations (V-shape, line, square, circle) make size legible and look dynamic without expensive physics simulation.

## Implementation

```csharp
using System.Collections.Generic;
using UnityEngine;

public class CrowdFormation : MonoBehaviour
{
    public enum FormationShape { Line, V, Square, Circle }

    [SerializeField] private FormationShape formation = FormationShape.V;
    [SerializeField] private float unitSpacingMeters = 0.4f;

    private List<Transform> units = new List<Transform>();

    public void AddUnits(int count)
    {
        for (int i = 0; i < count; i++)
            units.Add(null);
    }

    public void RemoveUnits(int count)
    {
        int removeCount = Mathf.Min(count, units.Count);
        units.RemoveRange(units.Count - removeCount, removeCount);
    }

    /// Returns an array of local-space positions for each unit based on the current formation.
    public Vector3[] LayoutPositions()
    {
        var positions = new Vector3[units.Count];
        switch (formation)
        {
            case FormationShape.Line:
                for (int i = 0; i < units.Count; i++)
                    positions[i] = new Vector3((i - units.Count / 2f) * unitSpacingMeters, 0, 0);
                break;
            case FormationShape.V:
                for (int i = 0; i < units.Count; i++)
                {
                    float side = (i % 2 == 0) ? 1 : -1;
                    positions[i] = new Vector3(side * (i / 2 + 1) * unitSpacingMeters, 0, -(i / 2) * unitSpacingMeters);
                }
                break;
            default:
                for (int i = 0; i < units.Count; i++)
                    positions[i] = new Vector3(i * unitSpacingMeters, 0, 0);
                break;
        }
        return positions;
    }
}
```

## Avoid

- No formation — a single-character runner that grows a "crowd" by stretching the character sprite is not crowd accretion; players cannot perceive unit count.
- Fully physics-based crowd simulation — at 50-200 NPCs, physics crowd simulation will destroy frame rate on mobile; use formation positions and simple steering agents instead.
- Static formation that never updates when `AddUnits`/`RemoveUnits` is called — each call must trigger a layout recalculation.

## Gotchas

- `LayoutPositions` returns local-space positions relative to the crowd leader's transform; each unit's world position is `leader.TransformPoint(positions[i])`.
- For V-shape, stagger units back and sideways — purely lateral rows don't look like a "V" and obstruct the leader's forward view.
- Circle formation requires `Mathf.Cos`/`Mathf.Sin` with `2π * i / count` — implement it similarly to the Line case.
- Crowd City shows the crowd count as a numeric HUD; always expose `units.Count` as a public property so the UI layer can read it.
</content>
