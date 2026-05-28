using UnityEngine;

public class ColorSortLevelGenerator : MonoBehaviour
{
    // Forward random placement, no solvability guarantee, no seed.
    public int colorCount = 4;

    public int[] Generate()
    {
        var result = new int[colorCount * 4];
        for (int i = 0; i < result.Length; i++)
            result[i] = Random.Range(0, colorCount);
        return result;
    }
}
