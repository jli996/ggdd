# Expectations: raid-extract-loop-with-risk-gradient

After applying this guide, the agent's `Assets/Scripts/ExtractionZone.cs` should:

1. Have an `openWindowSeconds` serialized field with value between 30 and 300.
2. Have a `distanceFromSpawn` (or similar) serialized field.
3. Have a `lootRewardMultiplier` (or similar) serialized field.
4. Expose `IsOpen` (property or method) that returns true only while the window is active.
5. Expose `Open()` that starts the window.
6. Expose `RewardForExtract(float)` that returns a value INCREASING with `distanceFromSpawn`.
