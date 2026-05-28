# Expectations: exponential-production-prestige-loops

After applying this guide, the agent's `Assets/Scripts/PrestigeSystem.cs` should:

1. Declare `perTierProductionMultiplier` as a serialized float with a value greater than 1 (ensuring exponential, not linear, growth).
2. Declare `prestigeBoostPerPoint` as a serialized float greater than 0 (each prestige point increases production).
3. Implement `ProductionAtTier(int tier, int prestigePoints)` using `Mathf.Pow` to scale production exponentially per tier.
4. Implement `PrestigePointsEarned(float totalLifetimeProduction)` returning an int (sqrt-scaled meta-currency).
5. `ProductionAtTier` accepts both (int tier) and (int prestigePoints) parameters and references both in its body.
</content>
