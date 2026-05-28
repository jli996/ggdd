# Expectations: partial-pour-rules

After applying this guide, the agent's `Assets/Scripts/BottlePour.cs` should:

1. Have a serialized `bottleCapacity` int in the range [3, 8].
2. Expose a `CanPour(int topColorSrc, int topColorDst, int dstFillCount)` method (3 int parameters) with color-match logic.
3. `CanPour` body includes a color equality check (`==`) between src and dst top colors.
4. Expose a `HowMuchPours(int srcCount, int dstCount, int srcTopRun)` method returning int.
5. `HowMuchPours` uses `Mathf.Min` to cap the transfer at available destination capacity.
</content>
