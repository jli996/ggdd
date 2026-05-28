# Expectations: coalition-clan-endgame

After applying this guide, the agent's `Assets/Scripts/ClanSystem.cs` should:

1. Be a ScriptableObject decorated with `[CreateAssetMenu]`.
2. Have `soloProgressionCap` default strictly less than `clanMaxLevel` (clan membership is meaningfully better).
3. Declare a `[System.Serializable]` `ClanBonus` inner class with `clanSize` and `bonusMultiplier` fields.
4. Have a serialized `bonuses` array of `ClanBonus` entries.
5. Expose a `MaxAchievableLevel(bool inClan)` method returning the appropriate level cap.
