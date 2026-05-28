# Task

Implement `Assets/Scripts/VisionCone.cs` as a MonoBehaviour. Provide:
- Serialized `visionRangeMeters` (float, ~20), `coneAngleDegrees` (float, ~90), `lightThreshold` (float, ~0.3), `motionVisibilityBoost` (float, >1.0).
- `CanSee(Vector3 targetPos, float targetLightLevel, float targetSpeed)` returning bool.
  - Use `Vector3.Distance` to check range.
  - Use `Vector3.Angle` for the cone angle check (compare against half of coneAngleDegrees).
  - Apply `motionVisibilityBoost` when target is moving.
  - Reduce effective range when targetLightLevel is below lightThreshold.
