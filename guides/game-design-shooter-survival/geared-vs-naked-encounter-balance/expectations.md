# Expectations: geared-vs-naked-encounter-balance

After applying this guide, the agent's `Assets/Scripts/EncounterBalance.cs` should:

1. Declare a `ZoneTier` enum with at least three distinct values (e.g. Coastal, MidInland, HighRisk).
2. Have a `nakedDamageSoftCap` (or similar) serialized float.
3. Expose `ScaleDamageToTarget(float, bool)` that returns the soft-capped damage when the target is naked.
4. Expose `ZoneLootMultiplier()` that returns DIFFERENT values per zone (not a constant).
5. The coastal/low-tier zone should have a smaller multiplier than the high-risk zone.
