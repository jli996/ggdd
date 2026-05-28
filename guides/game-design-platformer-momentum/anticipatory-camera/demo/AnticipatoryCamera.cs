using UnityEngine;

public class AnticipatoryCamera : MonoBehaviour
{
    [SerializeField] private float leadDistance = 3f;
    [SerializeField] private float maxLeadDistance = 6f;
    [SerializeField] private float leadAtSpeed = 8f;

    /// <summary>
    /// Returns a camera offset in the direction of player velocity,
    /// proportional to speed, capped at maxLeadDistance.
    /// </summary>
    public Vector2 ComputeOffset(Vector2 playerVelocity)
    {
        float speed = playerVelocity.magnitude;
        if (speed < 0.01f) return Vector2.zero;

        float leadScale = Mathf.Clamp(speed / leadAtSpeed, 0f, 1f);
        Vector2 direction = playerVelocity / speed;
        return direction * Mathf.Min(leadDistance * leadScale, maxLeadDistance);
    }
}
