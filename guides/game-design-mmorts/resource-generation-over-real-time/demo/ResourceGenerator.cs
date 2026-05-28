using UnityEngine;

public class ResourceGenerator : MonoBehaviour
{
    [SerializeField] private float woodPerHour = 100f;
    [SerializeField] private float ironPerHour = 80f;
    [SerializeField] private float foodPerHour = 120f;
    [SerializeField] private int storageCap = 5000;

    /// Returns accumulated resource capped at storageCap.
    public float AccumulatedSince(float resourcePerHour, float hoursElapsed)
    {
        return Mathf.Min(resourcePerHour * hoursElapsed, storageCap);
    }
}
