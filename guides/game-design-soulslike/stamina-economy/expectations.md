# Expectations: stamina-economy

After applying this guide, the agent's `Assets/Scripts/StaminaSystem.cs` should:

1. Have serialized `maxStamina`, `regenPerSecond`, and `regenDelayAfterUseSeconds` fields.
2. `regenDelayAfterUseSeconds` must be greater than 0 (no instant regen).
3. Expose `TryConsume(float amount)` returning bool — false when insufficient stamina.
4. `TryConsume` must not allow `currentStamina` to go below 0.
5. Have a `lastStaminaUseAt` timestamp field to track the regen delay.
6. Regen logic in `Update()` that respects the delay before restoring stamina.
