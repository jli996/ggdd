---
id: generator-regen-energy-economy
category: game-design-casual-merge-2
title: Generator regen energy economy (1 energy per 3 minutes mobile standard)
description: Generators in merge-2 games gate play sessions via an energy currency that regenerates on a timer. Tune regen rate (mobile standard ~1 per 3 min), cost per item, and energy cap to shape session length without feeling stingy.
useCases:
  - "implement energy economy for merge game generator"
  - "tune energy regen rate for mobile merge-2 game"
  - "design generator spawn system in Travel Town style game"
  - "balance energy cost per item in merge puzzle game"
  - "implement offline energy regeneration with timestamp"
relatedGuides: []
appliesTo:
  - "merge-2 games with generator-based item production"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Generator regen energy economy

In Merge Mansion and Travel Town, generators are the tap-to-produce mechanic: tap a generator to spend energy and receive a low-tier item to merge. The energy system is the session-length gate: players run out and come back later. The mobile standard of 1 energy per 3 minutes balances "can't play forever" with "always some energy available on your next check-in."

## Implementation

```csharp
using UnityEngine;

public class Generator : MonoBehaviour
{
    [SerializeField] private float energyPerItemCost = 1f;
    [SerializeField] private float energyRegenSecondsPerUnit = 180f;
    [SerializeField] private int energyMaxCap = 100;
    [SerializeField] private float regenStartedAt;

    /// Returns the current energy available, clamped to energyMaxCap.
    public float CurrentEnergy(float storedEnergyAtStart, float now)
    {
        float elapsed = now - regenStartedAt;
        float regenerated = elapsed / energyRegenSecondsPerUnit;
        return Mathf.Min(storedEnergyAtStart + regenerated, energyMaxCap);
    }

    /// Deducts energyPerItemCost from remaining energy. Returns true if affordable.
    public bool TrySpawnItem(out float remainingEnergy, float currentEnergy)
    {
        if (currentEnergy >= energyPerItemCost)
        {
            remainingEnergy = currentEnergy - energyPerItemCost;
            return true;
        }
        remainingEnergy = currentEnergy;
        return false;
    }
}
```

## Avoid

- Infinite spawning with no energy system — players will exhaust the board in one session; your monetisation window closes.
- `energyRegenSecondsPerUnit < 60` — faster than 1 per minute makes energy feel nearly infinite; the gate has no meaning.
- `energyRegenSecondsPerUnit > 600` — slower than 1 per 10 minutes crosses into frustrating territory; players churn.
- No `energyMaxCap` — letting energy accumulate indefinitely removes the "check in every day" incentive.

## Gotchas

- Store `regenStartedAt` as `Time.realtimeSinceStartup` or better a Unix timestamp so offline regen works correctly.
- `CurrentEnergy` is a pure function here — the caller passes in stored energy and "now" — which makes it unit-testable without mocking Time.
- Energy purchased via IAP should set `storedEnergyAtStart` directly; avoid bypassing `energyMaxCap` so the cap still applies.
- Merge Dragons uses a slightly faster regen (~1 per 2 min) for its "dragon energy" which gives a more active session feel. Adjust `energyRegenSecondsPerUnit` per your target session cadence.
</content>
