# Expectations: momentum-preservation-transitions

After applying this guide, the agent's `Assets/Scripts/MomentumTransitions.cs` should:

1. Have a `preserveHorizontalOnLand` serialized bool field.
2. Have a `wallJumpHorizontalRetention` serialized float field with value in (0, 1].
3. Have a `slopeMomentumGain` serialized float field.
4. Expose `ProjectLandingVelocity(Vector2)` that returns a Vector2 preserving horizontal velocity.
5. Expose `WallJumpVelocity(Vector2, Vector2)` that retains a fraction of horizontal momentum.
