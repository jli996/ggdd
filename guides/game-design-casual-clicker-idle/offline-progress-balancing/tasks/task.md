# Task

Implement `Assets/Scripts/OfflineProgress.cs`. Provide:
- `[SerializeField] float offlineProductionMultiplier` with a default between 0 and 1 (e.g., 0.40f — 40% of online rate).
- `[SerializeField] float maxOfflineHours` in [1, 48] (e.g., 8f).
- `OfflineEarnings(float currentRate, float now)` using `Mathf.Min` to cap elapsed time at `maxOfflineHours * 3600` seconds, then multiplying by `offlineProductionMultiplier`.
</content>
