# Task

Implement `Assets/Scripts/CollectibleLayout.cs` as a ScriptableObject. Provide:
- A `CollectibleClump` serializable inner class with `roomName` (string), `count` (int), and `requiresAbility` (string) fields.
- A `clumps` (CollectibleClump[]) array field.
- `TotalCollectibles()` iterating all clumps and summing their counts.
- `IsRoomEmpty(string roomName)` returning true if no clump for the given room has count > 0.
The layout models room-scale collectible density — each clump represents a discoverable beat in a specific room, optionally gated by a player ability.
