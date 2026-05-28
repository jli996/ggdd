# Task

Implement `Assets/Scripts/ComebackMechanic.cs`. Provide:
- Serialized `baseBountyGold` (float, ~300), `bountyScalingPerKgoldDeficit` (float, ~80), `maxBountyGold` (float, ~1200), and `neutralObjectiveBoostMaxPercent` (float, ≤0.30) fields.
- `BountyForKill(float losingTeamGold, float winningTeamGold)` computing scaled bounty capped at `maxBountyGold` using `Mathf.Min`.
