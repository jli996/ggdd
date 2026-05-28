# Task

Implement `Assets/Scripts/CrowdFormation.cs`. Provide:
- `FormationShape` enum: Line, V, Square, Circle.
- Serialized `formation (FormationShape, default V)` and `unitSpacingMeters (float, default 0.4f)`.
- `List<Transform> units` field.
- `AddUnits(int count)` and `RemoveUnits(int count)` methods.
- `LayoutPositions()` returning `Vector3[]` positions per unit based on formation shape and unit count.
</content>
