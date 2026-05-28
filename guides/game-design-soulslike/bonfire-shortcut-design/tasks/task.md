# Task

Implement `Assets/Scripts/BonfireShortcut.cs` as a ScriptableObject. Provide:
- A `Bonfire` serializable inner class with `id` (string), `displayName` (string), and `unlockShortcuts` (string[]) fields.
- A `Shortcut` serializable inner class with `shortcutId`, `fromBonfireId`, `toBonfireId` (strings), and `twoWay` (bool).
- `bonfires` (Bonfire[]) and `shortcuts` (Shortcut[]) array fields.
- `IsUnlockedShortcut(string shortcutId)` returning true if any bonfire's `unlockShortcuts` contains the given ID.
- `GetShortcut(string shortcutId)` returning the matching Shortcut or null.
