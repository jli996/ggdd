using UnityEngine;

public class ColorSortDifficulty : MonoBehaviour
{
    // All difficulty knobs change simultaneously per level, no inner class, no progression check.
    public int colorCount = 4;
    public int bottleCount = 6;
    public int extraEmpty = 2;

    public void NextLevel()
    {
        colorCount++;
        bottleCount++;
        extraEmpty--;
    }
}
