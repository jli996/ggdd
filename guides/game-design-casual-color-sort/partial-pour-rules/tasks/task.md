# Task

Implement `Assets/Scripts/BottlePour.cs`. Provide:
- Serialized `bottleCapacity` (int, default 4).
- `CanPour(int topColorSrc, int topColorDst, int dstFillCount)` returning true if dst is empty or src top color matches dst top color and dst is not full.
- `HowMuchPours(int srcCount, int dstCount, int srcTopRun)` returning `Mathf.Min(srcTopRun, bottleCapacity - dstCount)`.
</content>
