# Expectations: three-lane-geometry

After applying this guide, the agent's `Assets/Scripts/LaneController.cs` should:

1. Have a serialized `laneCount = 3` literal (specifically 3, not a variable or expression).
2. Have a serialized `laneWidthMeters` float in [1.5, 4.0].
3. Have a serialized `swipeMinDistancePx` float greater than 0 for deadzone filtering.
4. Expose an `OnSwipe(float deltaX)` method that snaps to an adjacent lane.
5. Expose an `IsValidLaneCount()` method that returns true only when laneCount == 3.
</content>
