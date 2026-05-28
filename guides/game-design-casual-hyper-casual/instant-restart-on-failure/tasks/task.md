# Task

Implement `Assets/Scripts/InstantRestart.cs`. Provide:
- `[SerializeField] float restartTransitionSeconds` ≤ 0.5f (e.g., 0.3f).
- `[SerializeField] bool showRetryButtonImmediately = true`.
- `OnPlayerDeath()` method that triggers a timed restart.
- `Restart()` method that resets game state.
- `IsInstantRestart()` returning true only if `restartTransitionSeconds <= 0.5f && showRetryButtonImmediately`.
</content>
