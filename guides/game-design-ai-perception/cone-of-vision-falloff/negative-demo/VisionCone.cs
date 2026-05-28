using UnityEngine;

// Anti-pattern: flat circle detection, no angle check, no light or motion factors.
public class VisionCone : MonoBehaviour
{
    public float detectionRadius = 10f;

    public bool CanSee(Vector3 targetPos)
    {
        // No cone, no light level, no motion — flat circle detection only.
        return Vector3.Distance(transform.position, targetPos) <= detectionRadius;
    }
}
