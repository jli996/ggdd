# Expectations: collectible-density-clumping

After applying this guide, the agent's `Assets/Scripts/CollectibleLayout.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `CollectibleClump` serializable inner class with `roomName`, `count`, and `requiresAbility` fields.
3. Have a `clumps` (CollectibleClump[]) array field.
4. Expose `TotalCollectibles()` summing all clump counts.
5. Expose `IsRoomEmpty(string roomName)` returning true if no clump for that room has count > 0.
