# Expectations: resource-generation-over-real-time

After applying this guide, the agent's `Assets/Scripts/ResourceGenerator.cs` should:

1. Have 3 serialized per-resource float fields: `woodPerHour`, `ironPerHour`, and `foodPerHour`, all with positive defaults.
2. Have a serialized `storageCap` int greater than 0.
3. Expose an `AccumulatedSince(float resourcePerHour, float hoursElapsed)` method returning `Mathf.Min(rate * hours, storageCap)`.
4. Not use `Update()` for resource generation (resources computed on demand, not per frame).
5. Have all per-resource rates (woodPerHour, ironPerHour, foodPerHour) default to values > 0.
