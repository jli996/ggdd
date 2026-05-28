using UnityEngine;

public class MatchCascade : MonoBehaviour
{
    [SerializeField] private int maxChainLength = 8;
    [SerializeField] private float chainBonusMultiplier = 0.5f;
    [SerializeField] private float perChainStepDelaySeconds = 0.18f;

    /// Returns score for a single chain step. chainIndex=0 means first match (no bonus).
    public float ScoreForChainStep(int baseScore, int chainIndex)
    {
        return baseScore * (1 + chainIndex * chainBonusMultiplier);
    }

    /// Returns true when the cascade should be aborted to prevent infinite loops.
    public bool ShouldAbortChain(int currentChainLength)
    {
        return currentChainLength >= maxChainLength;
    }
}
</content>
