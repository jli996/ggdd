# Expectations: generator-regen-energy-economy

After applying this guide, the agent's `Assets/Scripts/Generator.cs` should:

1. Have a serialized `energyPerItemCost` float greater than 0.
2. Have a serialized `energyRegenSecondsPerUnit` float in [60, 600] (1-10 min per energy unit, mobile standard).
3. Have a serialized `energyMaxCap` int greater than 0 to prevent unlimited accumulation.
4. Expose a `CurrentEnergy` method that computes available energy based on elapsed time.
5. Expose a `TrySpawnItem` method with an `out float` parameter for remaining energy after spend.
</content>
