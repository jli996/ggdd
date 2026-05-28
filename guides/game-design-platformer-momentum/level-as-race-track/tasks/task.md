# Task

Implement `Assets/Scripts/LevelRoute.cs` as a ScriptableObject. Provide:
- A `RoutePath` serializable inner class with `pathName` (string), `requiredSpeed` (float), `riskLevel` (int), and `estimatedSeconds` (float).
- A `paths` (RoutePath[]) array field.
- `OptimalPathSeconds()` that iterates over all paths and returns the minimum `estimatedSeconds`.
The class models a level with parallel routes at different speed/risk tiers (safe path open to all, faster paths gated by skill and speed).
