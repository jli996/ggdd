# Task

Implement `Assets/Scripts/LevelMode.cs`. Provide:
- A ScriptableObject with `[CreateAssetMenu]`.
- `ModeType` enum: MoveLimited, TimeLimited.
- `ObjectiveType` enum: ClearObstacles, CollectItems, ReachScore, DefeatBoss.
- Serialized fields: `mode (ModeType)`, `moveCount (int, default 25)`, `timeLimitSeconds (float, default 90f)`, `objective (ObjectiveType)`.
- `BudgetLabel()` returning "25 moves" when MoveLimited or "90 seconds" when TimeLimited, referencing both fields.
</content>
