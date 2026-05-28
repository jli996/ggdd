# Expectations: single-mechanic-level-grammar

After applying this guide, the agent's `Assets/Scripts/LevelGrammar.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `PlatformerMechanic` enum with at least 5 distinct mechanics.
3. Declare a `LevelSpec` serializable inner class with `levelName`, `knownMechanics` (array), `newMechanicsIntroduced` (array) fields.
4. Have a `levels` array field.
5. Expose `IsValidGrammar()` returning false if any level introduces > 1 new mechanic.
