# Expectations: set-piece-cadence

After applying this guide, the agent's `Assets/Scripts/SetPieceCadence.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `SetPieceType` enum with at least 5 distinct types.
3. Declare a `CadenceEntry` serializable inner class with `type`, `minutesIntoMission`, `durationMinutes` fields.
4. Have a `cadence` array field.
5. Have a `targetSpacingMinutes` serialized field in [15, 45].
6. Expose `IsValidCadence()` returning false if any two entries are closer than half the target spacing.
