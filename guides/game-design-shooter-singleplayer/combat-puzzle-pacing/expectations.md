# Expectations: combat-puzzle-pacing

After applying this guide, the agent's `Assets/Scripts/CombatEncounter.cs` should:

1. Declare an `EnemyWave` serializable class with `enemyTypes`, `totalEnemyCount`, `intensityCurve` fields.
2. Have a `waves` array serialized field.
3. Have `ammoDropMin` and `ammoDropMax` serialized fields (with min < max).
4. Have a `postEncounterHealthFraction` serialized field in (0, 1].
5. Expose `IsValid()` that returns true only when there are ≥2 waves AND each wave has ≥2 enemy types.
