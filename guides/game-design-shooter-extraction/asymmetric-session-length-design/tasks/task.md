# Task

Implement `Assets/Scripts/RaidConfig.cs` as a ScriptableObject with three raid-tier configurations:
- `shortRaid`: 15-25min, ~8 players.
- `mediumRaid`: 30-50min, ~10 players.
- `longRaid`: 60-90min, ~14 players.

Use an inner `MapTier` serializable class with `mapName`, `raidDurationMinutes`, `playerCount`.
