# Expectations: knockback-with-control-takeback

After applying this guide, the agent's `Assets/Scripts/Knockback.cs` should:

1. Have a serialized field for the lockout duration.
2. Cap the lockout duration at <= 0.3f (per the guide's principle of returning control quickly).
3. Have a public `ApplyHit(Vector2 impulse)` method that applies a Rigidbody2D impulse and starts the lockout.
4. Expose an `IsLockedOut` boolean/property that consumers can check.
5. Use `Time.time` to measure the lockout window (not a coroutine, so it composes with other locks).
