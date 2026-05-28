# Task

Implement `Assets/Scripts/RespawnSystem.cs` for a precision platformer. Provide:
- A `respawnDelaySeconds` serialized field (default ~0.4f, must be ≤ 1.0).
- A `currentCheckpoint` Transform field.
- A `deathCount` serialized int field.
- `OnPlayerDeath(Transform player)` that increments deathCount and schedules a respawn after `respawnDelaySeconds`.
- `SetCheckpoint(Transform t)` to update the checkpoint.
