# Expectations: unit-counter-triangles

After applying this guide, the agent's `Assets/Scripts/UnitCounters.cs` should:

1. Declare a `UnitType` enum with at least 4 values (e.g., Infantry, Cavalry, Spear, Archer).
2. Declare a `[System.Serializable]` `CounterRelation` inner class with `attacker`, `victim`, and `damageMultiplier` fields.
3. Have a serialized `relations` array of `CounterRelation` entries with at least 2 populated entries.
4. Expose a `DamageMultiplier(UnitType, UnitType)` method that looks up the relation array.
5. Return a default of 1.0 for unmatched unit pairs (no counter relationship defined).
6. Be decorated with `[CreateAssetMenu]` as a ScriptableObject.
