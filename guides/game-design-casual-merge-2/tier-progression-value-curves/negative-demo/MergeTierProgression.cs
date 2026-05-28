using UnityEngine;

public class MergeTierProgression : MonoBehaviour
{
    // Linear value scaling, no exponential, no Mathf.Pow.
    public float baseValue = 10f;

    public float ValueForTier(int tier)
    {
        return baseValue * tier;
    }
}
