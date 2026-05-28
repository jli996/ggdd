# Expectations: level-as-race-track

After applying this guide, the agent's `Assets/Scripts/LevelRoute.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `RoutePath` serializable inner class with `pathName`, `requiredSpeed`, `riskLevel`, and `estimatedSeconds` fields.
3. Have a `paths` (RoutePath[]) array field.
4. Expose `OptimalPathSeconds()` returning the shortest estimated time across all paths.
5. Have at least one path reachable with `requiredSpeed = 0` (safe path concept reflected in design).
6. Not hardcode a single linear path (the structure must support multiple paths).
