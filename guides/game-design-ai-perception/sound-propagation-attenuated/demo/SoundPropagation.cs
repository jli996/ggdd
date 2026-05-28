using UnityEngine;

public class SoundPropagation : MonoBehaviour
{
    [SerializeField] private float maxHearingRangeMeters = 30f;
    [SerializeField] private float wallAttenuationDb = 12f;

    /// <summary>
    /// Returns true if a sound at `source` is audible to a listener at `listener`
    /// given `wallsBetween` solid walls between them.
    /// </summary>
    public bool IsAudible(Vector3 source, Vector3 listener, int wallsBetween)
    {
        float distance = Vector3.Distance(source, listener);
        if (distance > maxHearingRangeMeters) return false;

        // Compute relative volume: 1.0 at distance=0, falls off with distance.
        float distanceFactor = 1f - Mathf.Clamp01(distance / maxHearingRangeMeters);

        // Each wall subtracts wallAttenuationDb from a normalized 100dB source.
        float attenuatedDb = 100f - wallsBetween * wallAttenuationDb;
        if (attenuatedDb <= 0f) return false;

        // Audible if distance factor and attenuation together exceed threshold.
        float attenuationFactor = Mathf.Clamp01(attenuatedDb / 100f);
        return distanceFactor * attenuationFactor > 0.05f;
    }
}
