# Expectations: round-based-economy-reset

After applying this guide, the agent's `Assets/Scripts/EconomySystem.cs` should:

1. Declare serialized fields for: `startingMoney`, `winBonus`, `baseLossBonus`, `lossStreakIncrement`, `maxLossBonus`, `killReward`, `moneyCap`.
2. The win bonus should be GREATER than the maxLossBonus (winning > losing).
3. Per-kill reward should be ≤ baseLossBonus / 2 (kills are flavor, not primary income).
4. Expose `LossBonusForStreak(int consecutiveLosses)` that escalates with streak length, capped at maxLossBonus.
5. Expose `AddRoundReward(int, bool, int, int)` that applies the per-round bonus, kill reward, and clamps to moneyCap.
