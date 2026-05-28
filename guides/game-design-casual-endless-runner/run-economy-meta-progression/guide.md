---
id: run-economy-meta-progression
category: game-design-casual-endless-runner
title: Run economy & meta-progression (coins, unlockables, failure keep)
description: Every run earns coins that unlock characters, boards, and power-ups. Critically, failed runs still pay out a fraction of coins so no run feels wasted. This "every run is productive" principle — used in Subway Surfers and Temple Run 2 — is the engine of long-term retention.
useCases:
  - "implement run economy with coins and unlockables in endless runner"
  - "design meta-progression for Temple Run or Subway Surfers style game"
  - "keep partial coins on failure in endless runner Unity game"
  - "add character and board unlocks via in-run currency"
  - "use ScriptableObject for unlockable catalogue in runner game"
relatedGuides: []
appliesTo:
  - "endless runner games with meta-progression via in-run currency"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Run economy & meta-progression

Subway Surfers gives coins on every run, win or lose. Temple Run 2 retains gems collected mid-run even after death. The psychological effect is consistent: the player always makes progress toward the next character or board. Zero-on-failure economies feel punitive; they break the "one more go" loop that drives session length.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "Runners/RunEconomy")]
public class RunEconomy : ScriptableObject
{
    public enum UnlockType { Character, Board, PowerUp }

    [System.Serializable]
    public class Unlockable
    {
        public string     name;
        public int        costCoins;
        public UnlockType unlockType;
    }

    [SerializeField] private Unlockable[] unlockables;
    [SerializeField] private int   baseCoinsPerSecond = 2;
    /// Fraction of earned coins kept on failure. > 0 so no run is wasted.
    [SerializeField] private float failureCoinKeepPercent = 0.5f;

    /// Returns coins earned for a run. On failure, pays out a fraction.
    public float CoinsEarned(float runSeconds, bool succeeded)
    {
        float gross = baseCoinsPerSecond * runSeconds;
        return succeeded ? gross : gross * failureCoinKeepPercent;
    }
}
```

## Avoid

- `failureCoinKeepPercent = 0` — zero payout on failure makes every death a punishment, killing the "one more run" impulse.
- Unlockables without meaningful variety — a single UnlockType gives players nothing to look forward to; at minimum expose Character, Board, and PowerUp options.
- Pricing all unlockables identically — graduated costs (cheap boards, expensive characters, rare power-ups) create a natural progression ladder.

## Gotchas

- `failureCoinKeepPercent = 0.5f` means the player keeps 50% on death. Tune between 0.25 and 0.75; below 0.25 still feels punitive, above 0.75 removes the incentive to survive longer.
- `baseCoinsPerSecond` combined with the run speed means longer runs are naturally more rewarding, aligning the economy with skill (surviving longer = earning more).
- The `Unlockable` catalogue lives in a ScriptableObject so the economy can be re-balanced (or A/B tested) via asset variants without code changes.
- Consider a separate "daily challenge" coin bonus that resets daily — drives re-engagement without changing the core per-run economy.
</content>
