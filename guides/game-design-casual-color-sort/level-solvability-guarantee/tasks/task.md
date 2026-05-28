# Task

Implement `Assets/Scripts/ColorSortLevelGenerator.cs`. Provide:
- Serialized `colorCount` (int, default 4), `extraEmptyBottles` (int, default 2, >= 1), `scrambleStepCount` (int, > 10, default 30), `randomSeed` (int, default 12345).
- `Generate()` returning a `BottleState[]` generated via reverse-shuffle from solved state (using the seed for reproducibility).
- `EnsuredSolvable()` returning true (the algorithm guarantees solvability by construction).
</content>
