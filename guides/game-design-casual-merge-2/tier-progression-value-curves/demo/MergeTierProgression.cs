using UnityEngine;

[CreateAssetMenu(menuName = "MergeGame/MergeTierProgression")]
public class MergeTierProgression : ScriptableObject
{
    [SerializeField] private int maxTier = 12;
    [SerializeField] private float baseValue = 10f;
    [SerializeField] private float perTierValueMultiplier = 3.5f;

    public float ValueForTier(int tier)
    {
        return baseValue * Mathf.Pow(perTierValueMultiplier, tier);
    }

    public int TierFromMergeCount(int sameItemMerges)
    {
        return Mathf.FloorToInt(Mathf.Log(sameItemMerges + 1, 2));
    }
}
