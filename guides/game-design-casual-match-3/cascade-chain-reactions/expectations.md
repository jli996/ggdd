# Expectations: cascade-chain-reactions

After applying this guide, the agent's `Assets/Scripts/MatchCascade.cs` should:

1. Have a serialized `maxChainLength` int in the range [4, 20] to cap cascades.
2. Have a serialized `chainBonusMultiplier` float greater than 0 for escalating bonuses.
3. Expose a `ScoreForChainStep(int baseScore, int chainIndex)` method that scales score by chain depth.
4. Reference `chainIndex` in the scoring formula so chain depth affects the return value.
5. Expose a `ShouldAbortChain(int currentChainLength)` method returning bool to prevent infinite cascades.
6. Return true from `ShouldAbortChain` when `currentChainLength >= maxChainLength`.
</content>
