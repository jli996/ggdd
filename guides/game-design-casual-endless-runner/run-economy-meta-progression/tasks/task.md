# Task

Implement `Assets/Scripts/RunEconomy.cs` as a ScriptableObject. Provide:
- `[CreateAssetMenu]` attribute.
- `UnlockType` enum with ≥3 values (Character, Board, PowerUp).
- `[System.Serializable]` inner class `Unlockable` with `name (string)`, `costCoins (int)`, `unlockType (UnlockType)`.
- `[SerializeField] Unlockable[] unlockables`.
- `[SerializeField] float failureCoinKeepPercent` > 0 (e.g., 0.5f — player keeps 50% on failure).
- `CoinsEarned(float runSeconds, bool succeeded)` returning full coins on success, reduced by `failureCoinKeepPercent` on failure.
</content>
