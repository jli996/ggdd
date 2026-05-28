# Expectations: run-economy-meta-progression

After applying this guide, the agent's `Assets/Scripts/RunEconomy.cs` should:

1. Be a ScriptableObject decorated with `[CreateAssetMenu]`.
2. Define a `UnlockType` enum with at least 3 values (Character, Board, PowerUp or equivalent).
3. Declare `failureCoinKeepPercent` as a serialized float strictly greater than 0 (player always keeps something on failure).
4. Define a `[System.Serializable]` inner class `Unlockable` with at least a `name`, `costCoins`, and `unlockType` field.
5. Implement `CoinsEarned(float runSeconds, bool succeeded)` that references `failureCoinKeepPercent` when `!succeeded`.
</content>
