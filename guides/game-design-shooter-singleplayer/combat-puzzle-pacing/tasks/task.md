# Task

Implement `Assets/Scripts/CombatEncounter.cs` for a singleplayer FPS encounter. Provide:
- An `EnemyWave` serializable inner class with `enemyTypes` (string[]), `totalEnemyCount` (int), `intensityCurve` (float).
- Serialized fields: `waves` (EnemyWave[]), `ammoDropMin`/`ammoDropMax` (int, min < max), `postEncounterHealthFraction` (float in (0,1]).
- `IsValid()` returning true only if ≥2 waves exist AND each wave has ≥2 distinct enemy types.
