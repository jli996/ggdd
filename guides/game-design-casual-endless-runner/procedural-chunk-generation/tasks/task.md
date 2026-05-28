# Task

Implement `Assets/Scripts/ChunkGenerator.cs` as a ScriptableObject. Provide:
- `[CreateAssetMenu]` attribute.
- `[System.Serializable]` inner class `LevelChunk` with `chunkName (string)`, `chunkPrefab (GameObject)`, `difficultyTier (int)`, `secondsToTraverseAtBaseSpeed (float)`.
- `[SerializeField] LevelChunk[] chunkPool`.
- `[SerializeField] int chunksPerRun = 30`.
- `PickNextChunk(int currentDifficultyTier)` returning a `LevelChunk` from the pool filtered by tier.
</content>
