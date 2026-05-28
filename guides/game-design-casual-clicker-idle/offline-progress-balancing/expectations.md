# Expectations: offline-progress-balancing

After applying this guide, the agent's `Assets/Scripts/OfflineProgress.cs` should:

1. Declare `offlineProductionMultiplier` as a serialized float strictly between 0 and 1 (offline rate must be less than online rate).
2. Declare `maxOfflineHours` as a serialized float in the range [1, 48] to cap offline accumulation.
3. Implement `OfflineEarnings(float currentRate, float now)` returning a float representing capped offline earnings.
4. Use `Mathf.Min` inside `OfflineEarnings` to enforce the time cap.
5. Reference `offlineProductionMultiplier` in the earnings calculation (offline must be a fraction of online rate).
</content>
