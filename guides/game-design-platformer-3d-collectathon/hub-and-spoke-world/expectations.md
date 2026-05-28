# Expectations: hub-and-spoke-world

After applying this guide, the agent's `Assets/Scripts/WorldStructure.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `PlayerAbility` enum with at least 5 distinct values (including `None` as the "always open" sentinel).
3. Declare a `SubWorld` serializable inner class with `worldName`, `unlockedByAbility`, and `internalCollectibles` fields.
4. Have a `hub` field of type `SubWorld` and a `subWorlds` array.
5. Expose `CanAccess(SubWorld, PlayerAbility[])` returning true if the player holds the required ability (or ability is None).
6. Expose `AccessibleWorlds(PlayerAbility[])` returning the subset of sub-worlds the player can currently enter.
