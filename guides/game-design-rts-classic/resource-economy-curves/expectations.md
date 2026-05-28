# Expectations: resource-economy-curves

After applying this guide, the agent's `Assets/Scripts/RtsEconomy.cs` should:

1. Have a serialized `mineralsPerWorkerPerSecond` float in the range (0, 5).
2. Have a serialized `workersCapPerExpansion` int greater than 0.
3. Have a serialized `expansionCostScaling` float strictly greater than 1.0 to enforce exponential cost growth.
4. Expose an `EconomicCapacity(int expansionCount, int totalWorkers)` method returning minerals per second.
5. Expose an `ExpansionCost(int existingExpansions)` method that uses exponential scaling (Mathf.Pow or equivalent multiplication).
6. Cap worker throughput based on expansion count, so over-saturation is mechanically limited.
