# Task

Implement `Assets/Scripts/Knockback.cs`. Provide:
- `ApplyHit(Vector2 impulse)` that adds force to a serialized Rigidbody2D field and starts a lockout window.
- A read-only `IsLockedOut` property that returns true while the lockout is active.
- A serialized `lockoutDuration` field (default 0.18f). Cap it to 0.3f maximum — long lockouts feel punishing.
