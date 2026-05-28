# Expectations: cone-of-vision-falloff

After applying this guide, the agent's `Assets/Scripts/VisionCone.cs` should:

1. Have serialized `visionRangeMeters`, `coneAngleDegrees`, `lightThreshold`, and `motionVisibilityBoost` fields.
2. Expose `CanSee(Vector3 targetPos, float targetLightLevel, float targetSpeed)` with exactly 3 parameters.
3. Use `Vector3.Distance` to compute range from AI to target.
4. Use `Vector3.Angle` (or equivalent dot product) for the cone angle check.
5. Factor both light level and target motion speed into the visibility calculation.
6. Return false when the target is outside the vision range or outside the cone angle.
