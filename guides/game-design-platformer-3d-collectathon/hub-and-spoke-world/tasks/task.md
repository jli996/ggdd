# Task

Implement `Assets/Scripts/WorldStructure.cs` as a ScriptableObject for a 3D collectathon. Provide:
- A `PlayerAbility` enum with at least 5 values, including `None` (the "always accessible" sentinel).
- A `SubWorld` serializable inner class with `worldName` (string), `unlockedByAbility` (PlayerAbility), and `internalCollectibles` (int) fields.
- A `hub` field of type `SubWorld` and a `subWorlds` array (SubWorld[]).
- `CanAccess(SubWorld world, PlayerAbility[] playerAbilities)` returning true if the player holds the required ability or the world requires None.
- `AccessibleWorlds(PlayerAbility[] playerAbilities)` returning the subset of sub-worlds the player can currently enter.
