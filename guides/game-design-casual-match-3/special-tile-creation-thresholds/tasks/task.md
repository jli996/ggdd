# Task

Implement `Assets/Scripts/SpecialTileFactory.cs`. Provide:
- A ScriptableObject with `[CreateAssetMenu]`.
- `SpecialTileType` enum: None, LineBomb, ColorBomb, Explosion.
- `MatchShape` enum: Linear3, Linear4, Linear5, TShape, LShape, Square2x2.
- `[System.Serializable]` inner class `SpecialThreshold` with `shape (MatchShape)` and `creates (SpecialTileType)` fields.
- `[SerializeField] SpecialThreshold[] thresholds` mapping shapes to tile types.
- `WhatDoesShapeCreate(MatchShape shape)` returning the matching SpecialTileType (None if no entry).
</content>
