# Expectations: off-peak-persistence-with-build-queues

After applying this guide, the agent's `Assets/Scripts/BuildQueue.cs` should:

1. Declare a `[System.Serializable]` `BuildOrder` inner class with `buildingType`, `secondsToComplete`, and `queuedAtRealTime` fields.
2. Have a serialized `maxQueueSlots` int greater than 0.
3. Have a serialized `offlineProgressMultiplier` float greater than 0.
4. Expose a `CompletedBuildings(float currentRealTime)` method returning an int count.
5. Accept current time as a parameter (not read `Time.realtimeSinceStartup` internally) to support save-load testing.
