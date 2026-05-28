# Task

Implement `Assets/Scripts/StaminaSystem.cs` as a MonoBehaviour for a soulslike game. Provide:
- Serialized `maxStamina` (float, default ~100), `regenPerSecond` (float, ~30), `regenDelayAfterUseSeconds` (float, >0).
- `currentStamina` private field initialized to maxStamina in `Awake`.
- `lastStaminaUseAt` timestamp for regen delay tracking.
- `TryConsume(float amount)` returning false without deducting when stamina is insufficient; deducting and recording timestamp on success. Never allows negative stamina.
- `Update()` that regens stamina after the delay has passed, capped at maxStamina.
