using UnityEngine;

[CreateAssetMenu(menuName = "Runners/ChunkGenerator")]
public class ChunkGenerator : ScriptableObject
{
    [System.Serializable]
    public class LevelChunk
    {
        public string     chunkName;
        public GameObject chunkPrefab;
        public int        difficultyTier;
        public float      secondsToTraverseAtBaseSpeed;
    }

    [SerializeField] private LevelChunk[] chunkPool;
    [SerializeField] private int          chunksPerRun = 30;

    public LevelChunk PickNextChunk(int currentDifficultyTier)
    {
        var candidates = System.Array.FindAll(chunkPool,
            c => c.difficultyTier == currentDifficultyTier);

        if (candidates.Length == 0) return chunkPool[0];
        return candidates[Random.Range(0, candidates.Length)];
    }
}
