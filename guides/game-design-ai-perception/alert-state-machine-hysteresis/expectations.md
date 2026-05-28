# Expectations: alert-state-machine-hysteresis

After applying this guide, the agent's `Assets/Scripts/AlertState.cs` should:

1. Declare an `AlertLevel` enum with exactly 5 values: Unaware, Suspicious, Alert, Searching, Patrol.
2. Have a serialized `transitionCooldownSeconds` field greater than 0.
3. Have a `currentLevel` field of type `AlertLevel` and a `lastTransitionAt` timestamp field.
4. Expose `TransitionTo(AlertLevel)` that checks the hysteresis cooldown (using `Time.time`) and returns bool.
5. `TransitionTo` should return false (not apply transition) when within the cooldown window.
6. Expose `CanTransition()` or similar method to query whether a transition is currently allowed.
