# Expectations: esports-readable-visual-design

After applying this guide, the agent's `Assets/Scripts/EsportsReadability.cs` should:

1. Have `teamAColor` and `teamBColor` serialized Color fields.
2. Have a `killFeedPersistSeconds` serialized field in [3, 10].
3. Have a `observerModeEnabled` serialized bool defaulting to true.
4. Have a `observerHidesHud` serialized bool defaulting to true.
5. Expose `TeamColorContrast()` returning a numeric distance between the two team colors.
6. Expose `IsKillFeedReadable()` and `IsObserverModeReady()`.
