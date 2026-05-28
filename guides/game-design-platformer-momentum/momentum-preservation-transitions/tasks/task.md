# Task

Implement `Assets/Scripts/MomentumTransitions.cs` for a momentum-based platformer. Provide:
- A serialized `preserveHorizontalOnLand` bool field (default true).
- A serialized `slopeMomentumGain` float field (default ~1.2).
- A serialized `wallJumpHorizontalRetention` float field in (0, 1] (default ~0.85).
- `ProjectLandingVelocity(Vector2 airVelocity)` returning a Vector2 that preserves horizontal velocity when `preserveHorizontalOnLand` is true.
- `WallJumpVelocity(Vector2 fromWall, Vector2 currentVel)` blending the new wall-jump direction with a retained fraction of current horizontal velocity.
