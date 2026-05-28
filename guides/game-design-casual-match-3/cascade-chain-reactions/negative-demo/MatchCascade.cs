using UnityEngine;

public class MatchCascade : MonoBehaviour
{
    // No chain logic, no cap, flat scoring regardless of cascade depth.
    public float GetScore(int baseScore)
    {
        return baseScore;
    }
}
</content>
