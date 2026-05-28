using UnityEngine;

[CreateAssetMenu(fileName = "LevelRoute", menuName = "Game/Level Route")]
public class LevelRoute : ScriptableObject
{
    [System.Serializable]
    public class RoutePath
    {
        public string pathName;
        public float requiredSpeed;      // minimum entry speed (0 = open to all)
        public int riskLevel;            // 1=safe, 2=moderate, 3=risky
        public float estimatedSeconds;   // expected clear time for this path
    }

    public RoutePath[] paths;

    /// <summary>Returns the expected clear time of the fastest path.</summary>
    public float OptimalPathSeconds()
    {
        if (paths == null || paths.Length == 0) return float.MaxValue;
        float best = float.MaxValue;
        foreach (var p in paths)
        {
            if (p.estimatedSeconds < best) best = p.estimatedSeconds;
        }
        return best;
    }
}
