# Task

Implement `Assets/Scripts/MatchCascade.cs`. Provide:
- Serialized `maxChainLength` (int, default 8), `chainBonusMultiplier` (float, default 0.5f), and `perChainStepDelaySeconds` (float, default 0.18f) fields.
- `ScoreForChainStep(int baseScore, int chainIndex)` returning `baseScore * (1 + chainIndex * chainBonusMultiplier)`.
- `ShouldAbortChain(int currentChainLength)` returning true when `currentChainLength >= maxChainLength`.
</content>
