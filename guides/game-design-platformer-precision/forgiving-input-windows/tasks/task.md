# Task

Implement `Assets/Scripts/JumpTolerances.cs`. Provide:
- Serialized `coyoteTimeSeconds` (≤0.2), `jumpBufferSeconds` (≤0.3), `fullJumpVelocity`, `shortHopMultiplier` (<0.7).
- `OnGrounded()` and `OnJumpPressed()` updating state timestamps.
- `CanJump()` returning true only when within both coyote and buffer windows.
- `ComputeJumpVelocity(bool held)` returning full or scaled velocity.
