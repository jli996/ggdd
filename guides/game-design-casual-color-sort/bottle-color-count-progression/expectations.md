# Expectations: bottle-color-count-progression

After applying this guide, the agent's `Assets/Scripts/ColorSortDifficulty.cs` should:

1. Inherit from ScriptableObject and carry a `[CreateAssetMenu]` attribute.
2. Define a `[System.Serializable]` inner class `LevelDifficulty` with all four fields: levelNumber, colorCount, bottleCount, extraEmpty.
3. Have a `levels` array field of type `LevelDifficulty[]`.
4. Expose an `IsValidProgression()` method that validates consecutive level pairs.
5. `IsValidProgression` body includes a loop over `levels.Length` to check consecutive pairs.
</content>
