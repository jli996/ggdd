# Task

Implement `Assets/Scripts/MergeBoardGuard.cs`. Provide:
- Serialized `boardCapacity` (int, default 36), `spawnReservedSlots` (int, default 4), `idleItemDespawnSeconds` (float, default 600f), `sellEnabled` (bool, default true).
- `CanAcceptSpawn(int currentItemCount)` returning `currentItemCount + spawnReservedSlots <= boardCapacity`.
- `WouldBeStuck(int currentItemCount, int pendingMergeCount)` returning true when board is full and no merges are pending.
</content>
