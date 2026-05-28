# Task

Implement `Assets/Scripts/RunnerDifficulty.cs`. Provide:
- `[SerializeField] float baseSpeed` > 0 (e.g., 8f).
- `[SerializeField] float speedIncreasePerMinute` > 0 (e.g., 1.5f).
- `[SerializeField] float maxSpeed` > baseSpeed (e.g., 25f).
- `[SerializeField] AnimationCurve obstacleDensityOverTime` — designer-authored density curve.
- `SpeedAt(float elapsedSeconds)` returning `Mathf.Min(baseSpeed + (elapsed/60)*speedIncreasePerMinute, maxSpeed)`.
- `ObstacleDensityAt(float elapsedSeconds)` evaluating the AnimationCurve.
</content>
