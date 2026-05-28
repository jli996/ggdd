# Expectations: anticipatory-camera

After applying this guide, the agent's `Assets/Scripts/AnticipatoryCamera.cs` should:

1. Have a serialized `leadDistance` float field.
2. Have a serialized `maxLeadDistance` float field.
3. Have a serialized `leadAtSpeed` float field.
4. Expose `ComputeOffset(Vector2 playerVelocity)` returning a Vector2 offset proportional to velocity.
5. Use `Mathf.Clamp` or `Mathf.Min` to cap the offset at `maxLeadDistance`.
6. Return `Vector2.zero` (or equivalent) when the player is stationary.
