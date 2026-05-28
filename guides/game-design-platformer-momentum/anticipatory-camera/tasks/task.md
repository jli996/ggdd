# Task

Implement `Assets/Scripts/AnticipatoryCamera.cs` as a MonoBehaviour. Provide:
- Serialized `leadDistance` (default ~3f), `maxLeadDistance` (default ~6f), and `leadAtSpeed` (default ~8f) float fields.
- `ComputeOffset(Vector2 playerVelocity)` that returns a Vector2 offset in the direction of player velocity, scaled by speed / leadAtSpeed, capped at maxLeadDistance using Mathf.Clamp or Mathf.Min.
- Returns Vector2.zero when player speed is near zero.
