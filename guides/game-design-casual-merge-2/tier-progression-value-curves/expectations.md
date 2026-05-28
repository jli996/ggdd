# Expectations: tier-progression-value-curves

After applying this guide, the agent's `Assets/Scripts/MergeTierProgression.cs` should:

1. Inherit from ScriptableObject and carry a `[CreateAssetMenu]` attribute.
2. Have a serialized `maxTier` int greater than 5 (e.g., 12).
3. Have a serialized `perTierValueMultiplier` float strictly greater than 2 — must be exponential, not linear.
4. Expose a `ValueForTier(int tier)` method that uses `Mathf.Pow` to compute exponential value growth.
5. Expose a `TierFromMergeCount(int sameItemMerges)` method that converts merge count to tier.
</content>
