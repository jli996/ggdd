# Expectations: comeback-mechanics-without-invalidating-leads

After applying this guide, the agent's `Assets/Scripts/ComebackMechanic.cs` should:

1. Have 4 serialized scaling fields: `baseBountyGold`, `bountyScalingPerKgoldDeficit`, `maxBountyGold`, and `neutralObjectiveBoostMaxPercent`.
2. Ensure `maxBountyGold` default value is strictly greater than `baseBountyGold` (cap is meaningful).
3. Have `neutralObjectiveBoostMaxPercent` in range (0, 0.5] to prevent objective dominance.
4. Expose a `BountyForKill(float, float)` method that uses `Mathf.Min` to cap the result.
5. Reference the scaling field (`bountyScalingPerKgoldDeficit`) in the method body.
