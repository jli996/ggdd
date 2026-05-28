# Expectations: three-phase-game-arc

After applying this guide, the agent's `Assets/Scripts/MobaPhases.cs` should:

1. Declare a `GamePhase` enum with exactly 3 values: Lane, Mid, Late.
2. Declare a `[System.Serializable]` `ChampionPowerCurve` inner class with `championName`, `lanePower`, `midPower`, and `latePower` fields.
3. Have a serialized `champions` array of `ChampionPowerCurve` entries.
4. Expose a `PowerInPhase(string championName, GamePhase phase)` method returning a 0–10 power rating.
5. Expose a `PeakPhase(string championName)` method returning the phase with the highest power for that champion.
6. Be decorated with `[CreateAssetMenu]` as a ScriptableObject.
