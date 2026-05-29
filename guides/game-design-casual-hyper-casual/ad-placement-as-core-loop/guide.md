---
id: ad-placement-as-core-loop
category: game-design-casual-hyper-casual
title: Ad placement as core loop (interstitials + rewarded ads)
description: In hyper-casual games, ad pacing IS the economic design. Interstitials run every N runs (not every run); rewarded ads offer double-coins or a continue. A minimum time gap (60s) prevents user fatigue. Getting this balance right is the difference between a profitable game and one that's immediately uninstalled.
useCases:
  - "implement interstitial ad pacing in hyper-casual Unity game"
  - "design rewarded ad offer for double coins or continue"
  - "set minimum time between interstitial ads to avoid spamming"
  - "balance ad frequency with player retention in mobile game"
  - "check if interstitial should show based on run count and time"
relatedGuides: []
appliesTo:
  - "hyper-casual mobile games monetised primarily through advertising"
tags: [casual, hyper-casual, monetization, mobile-first]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Ad placement as core loop

Hyper-casual games are nearly always free-to-play with ads as the primary revenue model. Crossy Road pioneered the "rewarded ad as voluntary upgrade" model; most modern titles combine mandatory interstitials (every 3-5 runs) with optional rewarded ads (double-coins, extra life). The critical insight: ad pacing must be a first-class design decision, not an afterthought bolted on at launch.

## Implementation

```csharp
using UnityEngine;

public class AdPlacement : MonoBehaviour
{
    /// Show an interstitial every N completed runs.
    [SerializeField] private int interstitialEveryNRuns = 3;
    /// Never show two interstitials closer than this (seconds).
    [SerializeField] private float minSecondsBetweenInterstitials = 60f;
    /// Offer "watch ad for 2× coins" after each run.
    [SerializeField] private bool offerRewardedDoubleCoins = true;
    /// Offer "watch ad to continue after failure".
    [SerializeField] private bool offerRewardedContinue = true;

    /// Returns true only when both the run-count AND time thresholds are satisfied.
    public bool ShouldShowInterstitial(int runsSinceLast, float secondsSinceLast)
    {
        return runsSinceLast >= interstitialEveryNRuns
            && secondsSinceLast >= minSecondsBetweenInterstitials;
    }
}
```

## Avoid

- Interstitial after every single run — players will quit within the first session; `interstitialEveryNRuns` must be ≥ 2.
- No minimum time gap — `minSecondsBetweenInterstitials = 0` means two ads can fire back-to-back if the player runs fast; most ad networks also penalise this with lower eCPM.
- Skipping rewarded ads — they are *voluntary* and the highest-eCPM format; `offerRewardedDoubleCoins` and `offerRewardedContinue` should both be true by default.

## Gotchas

- `ShouldShowInterstitial` uses `&&` intentionally: both conditions must be true simultaneously. An `||` would show ads too aggressively.
- Track `runsSinceLast` and `secondsSinceLast` in your game manager, resetting them after each interstitial fires.
- Google AdMob and Unity Ads both have their own frequency caps server-side; your client-side `minSecondsBetweenInterstitials` is a floor, not a bypass.
- "Continue on failure" rewarded ads work best if offered immediately after death, before the `InstantRestart` timer fires (see the companion guide).
- A/B test `interstitialEveryNRuns` between 3 and 5; industry data shows 3 is the engagement cliff for most hyper-casual genres.
</content>
