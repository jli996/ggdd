# Task

Implement `Assets/Scripts/MergeTierProgression.cs`. Provide:
- A ScriptableObject with `[CreateAssetMenu]`.
- Serialized `maxTier` (int, default 12), `baseValue` (float, default 10f), `perTierValueMultiplier` (float, must be > 2, e.g. 3.5f).
- `ValueForTier(int tier)` returning `baseValue * Mathf.Pow(perTierValueMultiplier, tier)`.
- `TierFromMergeCount(int sameItemMerges)` returning `Mathf.FloorToInt(Mathf.Log(sameItemMerges + 1, 2))`.
</content>
