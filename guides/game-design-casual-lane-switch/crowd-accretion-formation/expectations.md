# Expectations: crowd-accretion-formation

After applying this guide, the agent's `Assets/Scripts/CrowdFormation.cs` should:

1. Define a `FormationShape` enum with at least 3 values (Line, V, Square, Circle).
2. Have a serialized `unitSpacingMeters` float greater than 0.
3. Expose an `AddUnits(int count)` method that grows the crowd.
4. Expose a `RemoveUnits(int count)` method that shrinks the crowd.
5. Expose a `LayoutPositions()` method returning a Vector3 array (or equivalent) of formation positions.
6. `LayoutPositions` body references the `formation` field to choose the layout algorithm.
</content>
