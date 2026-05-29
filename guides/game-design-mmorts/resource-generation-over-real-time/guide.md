---
id: resource-generation-over-real-time
category: game-design-mmorts
title: Resource generation over real time (per-hour rates, storage caps)
description: MMORTS resources accumulate at per-hour rates while offline. Storage caps prevent infinite accumulation and create check-in incentives. Resources are calculated on return by multiplying rate by elapsed hours, capped at storage.
useCases:
  - "design mmorts offline resource generation"
  - "per-hour resource rate with storage cap"
  - "idle game resource accumulation design"
  - "offline resource calculation for mobile strategy"
  - "storage cap to encourage check-ins in mmorts"
relatedGuides: []
appliesTo:
  - "any MMORTS, idle game, or mobile strategy with time-based resource generation"
tags: [strategy, mmorts, economy, offline-progress, cap-and-decay]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Resource generation over real time

Resources in an MMORTS must accumulate while the player is offline. The core formula is simple: `accumulated = min(rate * hours, storageCap)`. Storage caps are essential — without them, players who check in rarely accumulate unbounded resources and the game loses its strategic tension around storage upgrades.

## Implementation

```csharp
using UnityEngine;

public class ResourceGenerator : MonoBehaviour
{
    [SerializeField] private float woodPerHour = 100f;
    [SerializeField] private float ironPerHour = 80f;
    [SerializeField] private float foodPerHour = 120f;
    [SerializeField] private int storageCap = 5000;

    /// Returns accumulated resource, capped at storageCap.
    public float AccumulatedSince(float resourcePerHour, float hoursElapsed)
    {
        return Mathf.Min(resourcePerHour * hoursElapsed, storageCap);
    }
}
```

## Avoid

- No storage cap — unbounded accumulation removes the strategic upgrade loop.
- Generating resources only in `Update()` — requires the player to be online; defeats offline progression.
- Same rate for all resources — differentiated rates create strategic decisions about which buildings to upgrade.
- Zero or negative rates — production grinds to a halt.

## Gotchas

- `storageCap` should be upgradeable via building tech tree in production; expose it as a serialized int so designers can tune per-building caps without code.
- `AccumulatedSince` takes rate and hours as parameters so it can be called for any resource type without per-resource methods.
- In production, hours elapsed is derived from `DateTime.UtcNow - lastLoginTime`; the float parameter here decouples the method from system time for testability.
- Food-as-population mechanic: `foodPerHour` can be negative if army upkeep exceeds production — the formula still works (returns a negative accumulation = drain).
