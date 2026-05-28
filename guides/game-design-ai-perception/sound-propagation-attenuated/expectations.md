# Expectations: sound-propagation-attenuated

After applying this guide, the agent's `Assets/Scripts/SoundPropagation.cs` should:

1. Have a serialized `maxHearingRangeMeters` field (float, > 0).
2. Have a serialized `wallAttenuationDb` field (float, > 0).
3. Expose `IsAudible(Vector3 source, Vector3 listener, int wallsBetween)` with exactly 3 parameters.
4. `IsAudible` must use `Mathf` (Clamp01 or similar) for the attenuation calculation.
5. Return false when the source is beyond `maxHearingRangeMeters`.
6. Return false when `wallsBetween` is high enough that attenuation fully blocks sound.
