using UnityEngine;

public class VisionCone : MonoBehaviour
{
    [SerializeField] private float visionRangeMeters = 20f;
    [SerializeField] private float coneAngleDegrees = 90f;
    [SerializeField] private float lightThreshold = 0.3f;
    [SerializeField] private float motionVisibilityBoost = 1.5f;

    /// <summary>
    /// Returns true if the AI can see the target given its position, ambient light, and movement speed.
    /// Does NOT include a line-of-sight raycast — add one externally if needed.
    /// </summary>
    public bool CanSee(Vector3 targetPos, float targetLightLevel, float targetSpeed)
    {
        float distance = Vector3.Distance(transform.position, targetPos);

        // Apply motion visibility boost to effective light level.
        float effectiveLightLevel = targetSpeed > 0.1f
            ? targetLightLevel * motionVisibilityBoost
            : targetLightLevel;

        // Darkness reduces effective detection range.
        float effectiveRange = effectiveLightLevel >= lightThreshold
            ? visionRangeMeters
            : visionRangeMeters * 0.5f;

        if (distance > effectiveRange) return false;

        // Cone angle check.
        Vector3 dirToTarget = (targetPos - transform.position).normalized;
        float angle = Vector3.Angle(transform.forward, dirToTarget);
        return angle <= coneAngleDegrees * 0.5f;
    }
}
