# Task

Implement `Assets/Scripts/BuildQueue.cs`. Provide:
- A `[System.Serializable]` `BuildOrder` inner class with `buildingType (string)`, `secondsToComplete (float)`, and `queuedAtRealTime (float)`.
- Serialized `queue` (BuildOrder[]), `maxQueueSlots` (int, default 3), and `offlineProgressMultiplier` (float, default 1.0) fields.
- `CompletedBuildings(float currentRealTime)` returning how many queue entries have completed given the current real time.
