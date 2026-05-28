# Expectations: full-loot-economy-with-friction

After applying this guide, the agent's `Assets/Scripts/LootDecay.cs` should:

1. Have a `decayPerUse` (or similar) serialized field with value in (0, 0.5].
2. Have a `vaultMaxItems` (or similar) serialized integer field with value > 0.
3. Have a `raidWindowStartHour` and `raidWindowDurationHours` (or similar) fields.
4. Expose `ApplyDurabilityLoss(float)` returning a clamped non-negative value.
5. Expose `CanAddToVault(int)` returning false when at cap.
6. Expose `IsRaidWindowOpen(float)` honoring the configured window.
