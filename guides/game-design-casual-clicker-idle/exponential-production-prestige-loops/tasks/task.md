# Task

Implement `Assets/Scripts/PrestigeSystem.cs`. Provide:
- `[SerializeField] float perTierProductionMultiplier` with a default > 1 (e.g., 2f) for exponential tier scaling.
- `[SerializeField] float prestigeBoostPerPoint` > 0 (e.g., 0.10f — each prestige point = +10% production).
- `ProductionAtTier(int tier, int prestigePoints)` using `Mathf.Pow(perTierProductionMultiplier, tier)` and factoring in prestige multiplier.
- `PrestigePointsEarned(float totalLifetimeProduction)` returning a sqrt-scaled int.
</content>
