# Expectations: asymmetric-session-length-design

After applying this guide, the agent's `Assets/Scripts/RaidConfig.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `MapTier` inner class (or similar) with `mapName`, `raidDurationMinutes`, `playerCount` fields.
3. Have at least 3 raid-tier fields (short / medium / long).
4. The short raid duration should be ≤ 25 minutes.
5. The long raid duration should be ≥ 60 minutes.
6. Medium raid duration should be between short and long.
