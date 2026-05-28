# Task

Implement `Assets/Scripts/AlertState.cs` as a MonoBehaviour. Provide:
- An `AlertLevel` enum with 5 values: Unaware, Suspicious, Alert, Searching, Patrol.
- A serialized `transitionCooldownSeconds` (float, > 0, default ~0.5).
- `currentLevel` (AlertLevel) and `lastTransitionAt` (float) fields.
- `TransitionTo(AlertLevel newLevel)` returning bool — returns false and does nothing if the cooldown has not elapsed; otherwise transitions and records the timestamp.
- `CanTransition()` returning true if the cooldown has elapsed.
