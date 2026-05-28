# Expectations: hit-stop-on-impact

After applying this guide, the agent's `Assets/Scripts/HitFeedback.cs` should:

1. Have a public `HitStop(...)` method.
2. Set `Time.timeScale = 0f` (or a value < 1) inside a coroutine.
3. Use `WaitForSecondsRealtime` (not `WaitForSeconds`) so the wait actually elapses while timeScale is paused.
4. Restore `Time.timeScale = 1f` after the wait.
5. Use a duration in the range 0.03f to 0.15f (sensible hit-stop window).
