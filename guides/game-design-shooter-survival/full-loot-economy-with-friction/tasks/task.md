# Task

Implement `Assets/Scripts/LootDecay.cs` for a full-loot survival shooter. Provide:
- Item decay: `ApplyDurabilityLoss(float current)` returns `current - decayPerUse`, clamped to ≥0.
- Vault cap: `CanAddToVault(int current)` returns true only if `current < vaultMaxItems`.
- Raid window: `IsRaidWindowOpen(float serverHour)` returns true only during the configured window.

Use serialized fields for `decayPerUse`, `vaultMaxItems`, `raidWindowStartHour`, `raidWindowDurationHours` so designers can tune without recompiling.
