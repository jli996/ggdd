# Task

Implement `Assets/Scripts/LevelGrammar.cs` as a ScriptableObject. Provide:
- A `PlatformerMechanic` enum (Walk, Jump, DoubleJump, Dash, WallJump, Crouch, GrappleHook).
- A `LevelSpec` serializable inner class with `levelName`, `knownMechanics` (PlatformerMechanic[]), `newMechanicsIntroduced` (PlatformerMechanic[]).
- A `levels` (LevelSpec[]) field.
- `IsValidGrammar()` returning false if any level's `newMechanicsIntroduced` length > 1.
