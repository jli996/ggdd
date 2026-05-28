# Expectations: stuck-state-prevention

After applying this guide, the agent's `Assets/Scripts/MergeBoardGuard.cs` should:

1. Have a serialized `boardCapacity` int greater than 0.
2. Have a serialized `spawnReservedSlots` int greater than 0 to keep spawn slots open.
3. Have a serialized `sellEnabled` bool field giving players a board-drain escape valve.
4. Expose a `CanAcceptSpawn(int currentItemCount)` method returning bool.
5. Expose a `WouldBeStuck(int currentItemCount, int pendingMergeCount)` method that checks both board fullness and pending merge count.
</content>
