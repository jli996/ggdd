# Task

Implement `Assets/Scripts/EconomySystem.cs` for a round-based competitive shooter. Provide:
- `LossBonusForStreak(int consecutiveLosses)` returning a streak-escalated bonus (baseLossBonus + (streak-1)*increment), capped at maxLossBonus.
- `AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)` returning the new money total (clamped at moneyCap).

Use serialized fields for all economy tuning so designers can rebalance without code changes.
