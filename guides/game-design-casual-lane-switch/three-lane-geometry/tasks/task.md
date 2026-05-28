# Task

Implement `Assets/Scripts/LaneController.cs`. Provide:
- Serialized `laneCount = 3` (int literal, must be exactly 3), `laneWidthMeters` (float, default 2.5f), `swipeMinDistancePx` (float, default 50f).
- Private `currentLane` and `targetLane` int fields.
- `OnSwipe(float deltaX)` snapping targetLane left/right within [0, laneCount-1], ignoring input below swipeMinDistancePx.
- `IsValidLaneCount()` returning true only if `laneCount == 3`.
</content>
