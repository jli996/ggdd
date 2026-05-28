# Expectations: persistent-world-session-join

After applying this guide, the agent's `Assets/Scripts/SessionGuard.cs` should:

1. Have a serialized `logOffSeconds` (or similar) field with a value between 10 and 120.
2. Have a serialized `relogCooldownSeconds` (or similar) field with a value between 30 and 600.
3. Expose `RequestLogOff()` and `CanCompleteLogOff()` methods (or equivalent gating).
4. Expose `OnDisconnect()` and `CanRejoin()` methods (or equivalent gating).
5. Use `Time.time` to measure elapsed windows (not a coroutine — must compose with reconnects).
