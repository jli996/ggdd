# Expectations: forgiving-input-windows

After applying this guide, the agent's `Assets/Scripts/JumpTolerances.cs` should:

1. Have a `coyoteTimeSeconds` serialized field in (0, 0.2].
2. Have a `jumpBufferSeconds` serialized field in (0, 0.3].
3. Have a `fullJumpVelocity` and a `shortHopMultiplier` (the latter in (0, 0.7)).
4. Expose `OnGrounded()` and `OnJumpPressed()` for state tracking.
5. Expose `CanJump()` returning true only when both windows are active.
6. Expose `ComputeJumpVelocity(bool held)` that returns full velocity when held, scaled velocity otherwise.
