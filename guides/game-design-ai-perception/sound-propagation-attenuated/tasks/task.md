# Task

Implement `Assets/Scripts/SoundPropagation.cs` as a MonoBehaviour. Provide:
- Serialized `maxHearingRangeMeters` (float, ~30) and `wallAttenuationDb` (float, ~12).
- `IsAudible(Vector3 source, Vector3 listener, int wallsBetween)` returning bool:
  - Returns false if distance > maxHearingRangeMeters.
  - Reduces effective audibility by wallAttenuationDb per wall.
  - Uses `Mathf.Clamp01` (or `Mathf` equivalent) for clamping values.
  - Returns false when attenuation fully blocks the sound.
