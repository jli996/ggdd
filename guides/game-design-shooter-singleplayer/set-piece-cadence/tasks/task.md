# Task

Implement `Assets/Scripts/SetPieceCadence.cs` as a ScriptableObject. Provide:
- A `SetPieceType` enum with at least 5 types (Chase, Defend, Ambush, Vehicle, Sandbox, Stealth).
- A `CadenceEntry` serializable inner class with `type`, `minutesIntoMission`, `durationMinutes`.
- Serialized `cadence` (CadenceEntry[]) and `targetSpacingMinutes` (float, default ~25).
- `IsValidCadence()` returning true only when cadence entries are spaced ≥ targetSpacingMinutes/2 apart.
