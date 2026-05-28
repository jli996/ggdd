# Task

Implement `Assets/Scripts/ExtractionZone.cs` for an extraction shooter. Provide:
- A timed `openWindowSeconds` window (default ~90s).
- `Open()` to start the window.
- `IsOpen` returning true only during the window.
- `RewardForExtract(float baseLoot)` returning a value scaled by `distanceFromSpawn` (farther = more loot).

Use `Time.time` for the window. Tune `openWindowSeconds` between 30 and 300 seconds.
