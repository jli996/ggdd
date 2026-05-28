# Task

Implement `Assets/Scripts/Generator.cs`. Provide:
- Serialized `energyPerItemCost` (float, > 0), `energyRegenSecondsPerUnit` (float, default 180f), `energyMaxCap` (int, default 100), `regenStartedAt` (float).
- `CurrentEnergy(float storedEnergyAtStart, float now)` computing elapsed regen clamped to energyMaxCap.
- `TrySpawnItem(out float remainingEnergy, float currentEnergy)` deducting cost when affordable, returning bool.
</content>
