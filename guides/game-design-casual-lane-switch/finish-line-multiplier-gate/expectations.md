# Expectations: finish-line-multiplier-gate

After applying this guide, the agent's `Assets/Scripts/FinishLineMultiplier.cs` should:

1. Define a `[System.Serializable]` inner class `Gate` with `xMultiplier (int)`, `lanePosition (int)`, and `requiredCrowdSize (int)` fields.
2. Have a `gates` array field of type `Gate[]`.
3. Use int (not float) for `xMultiplier` — whole-number multipliers for readable UI.
4. Expose a `RewardForGate(int gateIndex, int crowdSize)` method returning int.
5. `RewardForGate` body references both `xMultiplier` and `crowdSize` in the scoring expression.
</content>
