# Task

Implement `Assets/Scripts/RtsEconomy.cs`. Provide:
- Serialized `mineralsPerWorkerPerSecond` (float, default ~0.6), `workersCapPerExpansion` (int, default ~16), `expansionCostMineralsBase` (float), and `expansionCostScaling` (float > 1.0) fields.
- `EconomicCapacity(int expansionCount, int totalWorkers)` capping effective workers at `expansionCount * workersCapPerExpansion` and returning minerals/second.
- `ExpansionCost(int existingExpansions)` returning `base * scaling^existing` via Mathf.Pow.
