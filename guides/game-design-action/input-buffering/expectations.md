# Expectations: input-buffering

After applying this guide, the agent's `Assets/Scripts/InputBuffer.cs` should:

1. Have a serialized field for the buffer window duration (e.g. `bufferWindow`).
2. Store the press time in a field (e.g. `bufferedAt`).
3. Have a method that records the press (e.g. `OnJumpPressed`).
4. Have a method that returns true only if a press is within the buffer window AND clears the buffer (`TryConsumeJump`).
5. Use a buffer window in the range 0.05f to 0.3f (sensible window).
