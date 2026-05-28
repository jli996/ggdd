# Expectations: card-rarity-without-power-creep

After applying this guide, the agent's `Assets/Scripts/CardData.cs` should:

1. Define a `CardRarity` enum with at least `Common`, `Uncommon`, `Rare` values.
2. `CardData` should be a `ScriptableObject` with `[CreateAssetMenu]`.
3. Declare a `rarity` field of type `CardRarity`.
4. Declare a `baseDamage` (or similar core-stat) field that is NOT a function of rarity (no `if (rarity == Rare) baseDamage *= 2` logic).
5. Declare an `effects` array (or list) field — rarity gates breadth, not raw stats.
