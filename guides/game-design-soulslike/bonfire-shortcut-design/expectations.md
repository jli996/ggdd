# Expectations: bonfire-shortcut-design

After applying this guide, the agent's `Assets/Scripts/BonfireShortcut.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `Bonfire` serializable inner class with `id`, `displayName`, and `unlockShortcuts` (string[]) fields.
3. Declare a `Shortcut` serializable inner class with `shortcutId`, `fromBonfireId`, `toBonfireId`, and `twoWay` fields.
4. Have a `bonfires` (Bonfire[]) array and a `shortcuts` (Shortcut[]) array.
5. Expose `IsUnlockedShortcut(string shortcutId)` that returns true if any bonfire unlocks the given shortcut.
6. Expose `GetShortcut(string shortcutId)` for shortcut lookup by ID.
