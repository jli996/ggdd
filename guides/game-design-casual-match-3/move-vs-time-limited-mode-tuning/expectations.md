# Expectations: move-vs-time-limited-mode-tuning

After applying this guide, the agent's `Assets/Scripts/LevelMode.cs` should:

1. Inherit from ScriptableObject and carry a `[CreateAssetMenu]` attribute.
2. Define a `ModeType` enum with both `MoveLimited` and `TimeLimited` values.
3. Define an `ObjectiveType` enum with at least 3 values (e.g., ClearObstacles, CollectItems, ReachScore).
4. Have serialized `moveCount` (int) and `timeLimitSeconds` (float) fields — both present regardless of active mode.
5. Expose a `BudgetLabel()` method that returns a different string depending on the active mode.
6. `BudgetLabel()` must reference both `moveCount` and `timeLimitSeconds` fields in its implementation.
</content>
