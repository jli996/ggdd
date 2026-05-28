# Expectations: ad-placement-as-core-loop

After applying this guide, the agent's `Assets/Scripts/AdPlacement.cs` should:

1. Declare `interstitialEveryNRuns` as a serialized int in the range [2, 10] (never show ads after every single run).
2. Declare `minSecondsBetweenInterstitials` as a serialized float in the range [30, 300] (minimum time gap between interstitials).
3. Declare both `offerRewardedDoubleCoins` and `offerRewardedContinue` as serialized bool fields.
4. Implement `ShouldShowInterstitial(int runsSinceLast, float secondsSinceLast)` returning a bool.
5. `ShouldShowInterstitial` body uses `&&` (both run-count AND time conditions must be satisfied).
</content>
