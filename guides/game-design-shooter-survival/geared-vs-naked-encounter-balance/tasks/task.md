# Task

Implement `Assets/Scripts/EncounterBalance.cs`. Provide:
- A `ZoneTier` enum (Coastal, MidInland, HighRisk).
- `ScaleDamageToTarget(float baseDamage, bool targetIsNaked)` that caps damage at `nakedDamageSoftCap` when the target is naked.
- `ZoneLootMultiplier()` that returns a per-zone float — high-risk zones should multiply loot more than coastal zones (so geared players have incentive to travel inland, away from fresh spawns).
