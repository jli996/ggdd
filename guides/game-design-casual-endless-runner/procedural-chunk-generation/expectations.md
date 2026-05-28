# Expectations: procedural-chunk-generation

After applying this guide, the agent's `Assets/Scripts/ChunkGenerator.cs` should:

1. Be a ScriptableObject decorated with `[CreateAssetMenu]`.
2. Define a `[System.Serializable]` inner class `LevelChunk` with 4 fields: `chunkName (string)`, `chunkPrefab (GameObject)`, `difficultyTier (int)`, `secondsToTraverseAtBaseSpeed (float)`.
3. Declare a `chunkPool` array field of type `LevelChunk[]`.
4. Declare `chunksPerRun` as a serialized field with a value > 0.
5. Implement `PickNextChunk(int)` method that selects a chunk by difficulty tier.
</content>
