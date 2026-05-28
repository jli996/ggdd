# Expectations: tight-respawn-loop

After applying this guide, the agent's `Assets/Scripts/RespawnSystem.cs` should:

1. Have a `respawnDelaySeconds` serialized field with value ≤ 1.0.
2. Have a `currentCheckpoint` field (Transform reference).
3. Have a `deathCount` serialized integer field.
4. Expose `OnPlayerDeath(Transform)` that increments death count and triggers respawn.
5. Expose `SetCheckpoint(Transform)` to update the active checkpoint.
