# Task

Implement `Assets/Scripts/ColorSortDifficulty.cs`. Provide:
- A ScriptableObject with `[CreateAssetMenu]`.
- `[System.Serializable]` inner class `LevelDifficulty` with fields: `levelNumber (int)`, `colorCount (int)`, `bottleCount (int)`, `extraEmpty (int)`.
- `[SerializeField] LevelDifficulty[] levels` array.
- `IsValidProgression()` returning true only if for each consecutive pair, at most one of (colorCount, bottleCount, extraEmpty) changed.
</content>
