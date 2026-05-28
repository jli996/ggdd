---
id: resource-economy-curves
category: game-design-rts-classic
title: Resource economy curves (mining rates, worker caps, expansion scaling)
description: RTS economies need 1-2 primary resources with worker efficiency curves and expansion as an economic gate. Tune mining rate, worker count caps, and expansion cost scaling to create meaningful macro decisions.
useCases:
  - "design rts resource economy system"
  - "tune worker count and mining rates"
  - "expansion cost scaling in rts"
  - "macro economy balance in real-time strategy"
  - "worker efficiency curve design"
relatedGuides: []
appliesTo:
  - "any real-time strategy game with worker-based resource gathering"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Resource economy curves

A strong RTS economy gives players meaningful choices about worker allocation and expansion timing. Too few workers and the economy stagnates; too many and there is no cost to over-saturating. Expansion should be an economic gate: costly enough to require planning, rewarding enough to incentivize aggression.

## Implementation

```csharp
using UnityEngine;

public class RtsEconomy : MonoBehaviour
{
    [SerializeField] private float mineralsPerWorkerPerSecond = 0.6f;
    [SerializeField] private int workersCapPerExpansion = 16;
    [SerializeField] private float expansionCostMineralsBase = 400f;
    [SerializeField] private float expansionCostScaling = 1.5f;

    /// Returns the effective minerals/second given expansions and workers.
    public float EconomicCapacity(int expansionCount, int totalWorkers)
    {
        int cap = expansionCount * workersCapPerExpansion;
        int effectiveWorkers = Mathf.Min(totalWorkers, cap);
        return effectiveWorkers * mineralsPerWorkerPerSecond;
    }

    /// Returns cost of the next expansion (exponential: base * scaling^existing).
    public float ExpansionCost(int existingExpansions)
    {
        return expansionCostMineralsBase * Mathf.Pow(expansionCostScaling, existingExpansions);
    }
}
```

## Avoid

- Linear expansion costs — expanding your third base should cost more than the second; flat costs remove strategic pressure.
- Unlimited worker saturation — without a per-base cap, players simply spam workers; there is no decision.
- Very high or very low `mineralsPerWorkerPerSecond` — too high trivializes the early game; too low makes the economy feel sluggish.
- Ignoring the expansion gate — cheap first expansions trivialize the map; free expansions remove the primary tension of RTS.

## Gotchas

- Worker-cap-per-expansion should be tuned with map size: a map with 4 bases typically caps at 8-12 workers per mineral line, not 24.
- `expansionCostScaling > 1.0` is required — a value of 1.0 or below produces flat or decreasing costs, defeating the purpose.
- Exponential growth (`Mathf.Pow`) can produce very large numbers quickly; clamp or cap expansion cost if needed for late-game UX.
- Economic leads compound fast in RTS — ensure harassment and raiding can disrupt miner efficiency to prevent deterministic snowballing.
