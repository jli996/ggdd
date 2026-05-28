# Task

Implement an input buffer in `Assets/Scripts/InputBuffer.cs`. Provide `OnJumpPressed()` to record the press and `TryConsumeJump(): bool` that returns true if a press happened within the last `bufferWindow` seconds (default 0.15f). Clear the buffer when consumed.
