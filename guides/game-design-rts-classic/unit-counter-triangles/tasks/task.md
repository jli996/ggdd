# Task

Implement `Assets/Scripts/UnitCounters.cs`. Provide:
- A `UnitType` enum with at least 4 values (Infantry, Cavalry, Spear, Archer, Mage).
- A `[System.Serializable]` `CounterRelation` inner class with `attacker (UnitType)`, `victim (UnitType)`, and `damageMultiplier (float)` fields.
- A serialized `relations` array pre-populated with at least 2 counter relationships.
- `DamageMultiplier(UnitType atk, UnitType victim)` that looks up the relations array and returns 1.0 as default.
- `[CreateAssetMenu]` attribute on the ScriptableObject class.
