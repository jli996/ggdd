# Expectations: instant-restart-on-failure

After applying this guide, the agent's `Assets/Scripts/InstantRestart.cs` should:

1. Declare `restartTransitionSeconds` as a serialized float with a default value ≤ 0.5 (the hyper-casual restart budget).
2. Declare `showRetryButtonImmediately` as a serialized bool defaulting to `true`.
3. Implement an `OnPlayerDeath()` method that initiates the restart transition.
4. Implement a `Restart()` method that resets game state.
5. Implement `IsInstantRestart()` that returns true only when both `restartTransitionSeconds <= 0.5f` AND `showRetryButtonImmediately` are satisfied.
</content>
