---
id: off-peak-persistence-with-build-queues
category: game-design-mmorts
title: Off-peak persistence with build queues (async progress while offline)
description: MMORTS players expect progress while offline. Build queues let players queue construction before sleeping; the game completes buildings based on real elapsed time. Design rewards but does not require frequent check-ins.
useCases:
  - "design mmorts offline build queue system"
  - "async offline progress in strategy game"
  - "build queue for mobile rts or mmorts"
  - "offline persistence game design pattern"
  - "construction queue with real-time completion"
relatedGuides: []
appliesTo:
  - "any MMORTS, mobile strategy, or idle-adjacent game with async offline progression"
tags: [strategy, mmorts, persistent-world, mobile-first, offline-progress]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Off-peak persistence with build queues

Players of MMORTS games check in a few times per day. Build queues must allow queuing 2-4 construction orders before going offline; when the player returns, the game calculates how many completed based on real elapsed time. This removes mandatory frequent check-ins while preserving the strategic planning layer.

## Implementation

```csharp
using UnityEngine;

public class BuildQueue : MonoBehaviour
{
    [System.Serializable]
    public class BuildOrder
    {
        public string buildingType;
        public float secondsToComplete;
        public float queuedAtRealTime;
    }

    [SerializeField] private BuildOrder[] queue;
    [SerializeField] private int maxQueueSlots = 3;
    [SerializeField] private float offlineProgressMultiplier = 1.0f;

    /// Returns how many queued buildings have completed by currentRealTime.
    public int CompletedBuildings(float currentRealTime)
    {
        if (queue == null) return 0;
        int completed = 0;
        float time = 0f;
        foreach (var order in queue)
        {
            float startTime = order.queuedAtRealTime + time;
            float finishTime = startTime + order.secondsToComplete / offlineProgressMultiplier;
            if (currentRealTime >= finishTime) completed++;
            time += order.secondsToComplete / offlineProgressMultiplier;
        }
        return completed;
    }
}
```

## Avoid

- Instant builds only — removes the time management layer that defines MMORTS depth.
- No offline progress — punishes players who can't check in every hour.
- `offlineProgressMultiplier` of 0 — division by zero and infinite build times.
- `maxQueueSlots` of 1 — forces constant check-ins; defeats the purpose of async queuing.

## Gotchas

- `offlineProgressMultiplier = 1.0f` means full-speed offline progress; some games halve it (0.5) to incentivize check-ins without making offline players non-competitive.
- `CompletedBuildings` should accept the current real time as a parameter (not read `Time.realtimeSinceStartup` internally) so it can be tested and called from save-load systems.
- Queue order matters — buildings complete sequentially, not in parallel.
- Persist `queuedAtRealTime` as a Unix timestamp in production; use `float` here for simplicity.
