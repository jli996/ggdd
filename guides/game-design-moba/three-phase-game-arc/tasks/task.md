# Task

Implement `Assets/Scripts/MobaPhases.cs`. Provide:
- A `GamePhase` enum with exactly 3 values: Lane, Mid, Late.
- A `[System.Serializable]` `ChampionPowerCurve` inner class with `championName (string)`, `lanePower (float)`, `midPower (float)`, `latePower (float)`.
- A serialized `champions` array field.
- `PowerInPhase(string championName, GamePhase phase)` returning the power value for the given phase.
- `PeakPhase(string championName)` returning the `GamePhase` with the highest power rating.
- `[CreateAssetMenu]` attribute as a ScriptableObject.
