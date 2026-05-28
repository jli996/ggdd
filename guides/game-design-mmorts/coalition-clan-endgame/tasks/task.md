# Task

Implement `Assets/Scripts/ClanSystem.cs`. Provide:
- `[CreateAssetMenu]` attribute as a ScriptableObject.
- Serialized `soloProgressionCap` (int, ~50) and `clanMaxLevel` (int, ~100) fields where `soloProgressionCap < clanMaxLevel`.
- A `[System.Serializable]` `ClanBonus` inner class with `clanSize (int)` and `bonusMultiplier (float)`.
- A serialized `bonuses` array of `ClanBonus` entries.
- `MaxAchievableLevel(bool inClan)` returning `clanMaxLevel` if in a clan, else `soloProgressionCap`.
