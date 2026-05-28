# Expectations: speed-obstacle-density-curve

After applying this guide, the agent's `Assets/Scripts/RunnerDifficulty.cs` should:

1. Declare `baseSpeed` as a serialized float > 0 (the starting forward speed).
2. Declare `speedIncreasePerMinute` as a serialized float > 0 (continuous difficulty ramp).
3. Declare `maxSpeed` with a value strictly greater than `baseSpeed` (cap is meaningful).
4. Implement `SpeedAt(float elapsedSeconds)` using `Mathf.Min` to enforce the `maxSpeed` cap.
5. Implement `ObstacleDensityAt(float elapsedSeconds)` that evaluates an `AnimationCurve` field.
</content>
