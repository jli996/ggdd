# Expectations: special-tile-creation-thresholds

After applying this guide, the agent's `Assets/Scripts/SpecialTileFactory.cs` should:

1. Inherit from ScriptableObject and carry a `[CreateAssetMenu]` attribute for designer-friendly asset creation.
2. Define a `SpecialTileType` enum with at least 4 values including `None`.
3. Define a `MatchShape` enum with at least 4 values (Linear3, Linear4, Linear5, TShape/LShape/Square).
4. Define a `[System.Serializable]` inner class `SpecialThreshold` with `shape` and `creates` fields.
5. Expose a `WhatDoesShapeCreate(MatchShape shape)` method returning the corresponding `SpecialTileType`.
6. Return `SpecialTileType.None` as the safe default when no threshold matches the shape.
</content>
