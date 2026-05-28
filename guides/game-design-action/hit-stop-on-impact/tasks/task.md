# Task

`Assets/Scripts/HitFeedback.cs` has a `HitStop(float duration)` stub. Implement it so it briefly pauses gameplay (Time.timeScale = 0) and then restores it after `duration` seconds of real time. Use a coroutine and `WaitForSecondsRealtime`. Default duration should be ~60ms.
