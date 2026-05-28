# Expectations: level-solvability-guarantee

After applying this guide, the agent's `Assets/Scripts/ColorSortLevelGenerator.cs` should:

1. Have a serialized `scrambleStepCount` int greater than 10 to ensure sufficient scrambling.
2. Have a serialized `randomSeed` field for reproducible level generation.
3. Have a serialized `extraEmptyBottles` int >= 1 (puzzles need empty space for pours).
4. Expose a `Generate()` method that returns a level layout.
5. Expose an `EnsuredSolvable()` method returning true (signalling reverse-shuffle algorithm, not forward-random).
</content>
