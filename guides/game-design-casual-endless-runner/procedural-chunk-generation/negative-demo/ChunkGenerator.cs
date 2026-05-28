using UnityEngine;

// Anti-pattern: fully procedural per-obstacle generation, no chunk pool.
public class ChunkGenerator : MonoBehaviour
{
    public GameObject obstaclePrefab;

    public void GenerateSection(float length)
    {
        int count = Random.Range(1, 10);
        for (int i = 0; i < count; i++)
        {
            float x = Random.Range(0f, length);
            Instantiate(obstaclePrefab, new Vector3(x, 0f, 0f), Quaternion.identity);
        }
    }
}
