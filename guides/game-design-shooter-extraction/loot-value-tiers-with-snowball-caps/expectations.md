# Expectations: loot-value-tiers-with-snowball-caps

After applying this guide, the agent's `Assets/Scripts/LootDrop.cs` should:

1. Declare a `LootTier` enum with at least 4 distinct tiers (e.g. Common, Uncommon, Rare, Legendary).
2. Declare per-tier drop-chance serialized fields summing to ~1.0.
3. The legendary (top-tier) chance must be ≤ 0.10 (rare-drop principle).
4. Declare a `secureSlotCount` (or similar) serialized integer field > 0.
5. Expose `RollTier(float roll01)` that returns the appropriate tier.
6. Expose `IsSecureSlot(int slotIndex)` that returns true for the first N slots.
