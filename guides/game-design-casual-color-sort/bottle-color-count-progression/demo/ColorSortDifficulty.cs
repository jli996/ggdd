using UnityEngine;

[CreateAssetMenu(menuName = "ColorSort/ColorSortDifficulty")]
public class ColorSortDifficulty : ScriptableObject
{
    [System.Serializable]
    public class LevelDifficulty
    {
        public int levelNumber;
        public int colorCount;
        public int bottleCount;
        public int extraEmpty;
    }

    [SerializeField] private LevelDifficulty[] levels;

    public bool IsValidProgression()
    {
        for (int i = 1; i < levels.Length; i++)
        {
            var prev = levels[i - 1];
            var curr = levels[i];
            int changes = 0;
            if (prev.colorCount  != curr.colorCount)  changes++;
            if (prev.bottleCount != curr.bottleCount) changes++;
            if (prev.extraEmpty  != curr.extraEmpty)  changes++;
            if (changes > 1) return false;
        }
        return true;
    }
}
