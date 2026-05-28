# Task

Implement `Assets/Scripts/DraftSystem.cs`. Provide:
- A `Role` enum with at least 5 values: Tank, Assassin, Support, Marksman, Mage.
- Serialized `banCount` (int, default 5), `pickCount` (int, default 5), and `pickAfterBan` (bool, default true) fields.
- `IsValidDraft(Role[] picks)` returning true only if at least 3 distinct roles are represented in the picks.
