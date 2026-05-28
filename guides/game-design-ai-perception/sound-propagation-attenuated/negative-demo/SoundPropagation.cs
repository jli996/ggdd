using UnityEngine;

// Anti-pattern: no wall attenuation, binary range check only, wrong signature.
public class SoundPropagation : MonoBehaviour
{
    public float hearingRange = 15f;

    public bool IsAudible(Vector3 source, Vector3 listener)
    {
        // Ignores walls entirely — sound magically passes through everything.
        return Vector3.Distance(source, listener) <= hearingRange;
    }
}
