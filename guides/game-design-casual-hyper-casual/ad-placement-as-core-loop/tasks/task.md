# Task

Implement `Assets/Scripts/AdPlacement.cs`. Provide:
- `[SerializeField] int interstitialEveryNRuns` in [2, 10] (e.g., 3).
- `[SerializeField] float minSecondsBetweenInterstitials` in [30, 300] (e.g., 60f).
- `[SerializeField] bool offerRewardedDoubleCoins = true`.
- `[SerializeField] bool offerRewardedContinue = true`.
- `ShouldShowInterstitial(int runsSinceLast, float secondsSinceLast)` returning true only when BOTH run-count AND time thresholds are met (use `&&`).
</content>
