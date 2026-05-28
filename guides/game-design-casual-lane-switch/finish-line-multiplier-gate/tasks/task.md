# Task

Implement `Assets/Scripts/FinishLineMultiplier.cs`. Provide:
- `[System.Serializable]` inner class `Gate` with `xMultiplier (int)`, `lanePosition (int)`, `requiredCrowdSize (int)`.
- `[SerializeField] Gate[] gates` with 3-5 gate entries (e.g., ×2, ×5, ×10 at different lane positions).
- `RewardForGate(int gateIndex, int crowdSize)` returning `crowdSize * gates[gateIndex].xMultiplier` if crowd meets requirement, else 0.
</content>
