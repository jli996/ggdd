---
id: finish-line-multiplier-gate
category: game-design-casual-lane-switch
title: Finish-line multiplier gate (x2/x5/x10 crowd size reward)
description: Lane-switch levels climax with a multiplier gate at the finish line. The player aims their crowd into the highest multiplier lane. The disproportionate reward (x5, x10) creates the session's emotional peak and a reason to replay.
useCases:
  - "implement finish line multiplier gate in crowd runner game"
  - "design reward gate mechanic in Run Race 3D style game"
  - "calculate crowd reward from gate multiplier in lane-switch game"
  - "add multiple gate options at finish line in casual runner"
  - "data-drive multiplier gate configuration with ScriptableObject"
relatedGuides: []
appliesTo:
  - "lane-switch casual mobile games with finish-line reward mechanics"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Finish-line multiplier gate

Run Race 3D and similar crowd-runner games end each level with a multiplier gate wall: a row of lanes, each labeled with a multiplier (×2, ×5, ×10). The player steers their crowd into the highest multiplier — but larger crowds may not fit through narrow gates. The gate moment is the emotional climax of the level; a ×10 hit with a full crowd feels disproportionately rewarding, which is exactly the goal.

## Implementation

```csharp
using UnityEngine;

public class FinishLineMultiplier : MonoBehaviour
{
    [System.Serializable]
    public class Gate
    {
        public int xMultiplier;
        public int lanePosition;
        public int requiredCrowdSize;
    }

    [SerializeField] private Gate[] gates = new Gate[]
    {
        new Gate { xMultiplier = 2,  lanePosition = 0, requiredCrowdSize = 1  },
        new Gate { xMultiplier = 5,  lanePosition = 1, requiredCrowdSize = 10 },
        new Gate { xMultiplier = 10, lanePosition = 2, requiredCrowdSize = 25 },
    };

    /// Returns crowd * multiplier if crowd meets the gate requirement; 0 otherwise.
    public int RewardForGate(int gateIndex, int crowdSize)
    {
        if (gateIndex < 0 || gateIndex >= gates.Length) return 0;
        var gate = gates[gateIndex];
        if (crowdSize < gate.requiredCrowdSize) return 0;
        return crowdSize * gate.xMultiplier;
    }
}
```

## Avoid

- Float multipliers — ×2.5 or ×1.7 look awkward on the gate sign; always use whole-number ints so "×10" renders cleanly in the UI.
- Rewarding all gates equally regardless of crowd size — gates should have `requiredCrowdSize` thresholds so the high-multiplier gate is genuinely harder to hit.
- Only one gate — a single gate removes player agency; three to five gates across the finish line is the standard for meaningful choice.

## Gotchas

- `lanePosition` ties the gate to a lane index (0 = left, 1 = center, 2 = right for 3-lane games); keep it in sync with `LaneController.laneCount` from the companion guide.
- The multiplier applies to `crowdSize` (number of units), not the level score — this makes the payoff scale with the player's skill at growing their crowd.
- For Run Race 3D, gates appear in the final 10% of the course; spawn them earlier if you want the player to make a lane-choice decision mid-run.
- Adding a negative gate (×0.5, "lose half") at a tempting position adds tension without mandatory negative reinforcement.
</content>
