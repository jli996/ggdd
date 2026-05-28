# Task

Implement `Assets/Scripts/EsportsReadability.cs`. Provide:
- Serialized `teamAColor`/`teamBColor` (Color) and `killFeedPersistSeconds`/`observerModeEnabled`/`observerHidesHud` fields.
- `TeamColorContrast()` returning the RGB distance between team colors.
- `IsKillFeedReadable()` returning true when `killFeedPersistSeconds` is in [3, 10].
- `IsObserverModeReady()` returning true only when observer mode is enabled AND HUD-hide is on.
