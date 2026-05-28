# Task

Implement `Assets/Scripts/SessionGuard.cs` to gate logout + relog in a persistent-world survival shooter. Provide:
- `RequestLogOff()` that starts a log-off window (default 30s).
- `CanCompleteLogOff()` returning true only after the window elapses.
- `OnDisconnect()` that records a disconnect timestamp.
- `CanRejoin()` returning true only after the relog cooldown (default 60s) elapses.

Use `Time.time` (NOT a coroutine — the system must survive server-side restarts via persisted timestamps).
