using UnityEngine;

public class MomentumTransitions : MonoBehaviour
{
    [SerializeField] private bool preserveHorizontalOnLand = true;
    [SerializeField] private float slopeMomentumGain = 1.2f;
    [SerializeField] private float wallJumpHorizontalRetention = 0.85f;

    /// <summary>
    /// When landing from air, preserve horizontal momentum.
    /// Returns the adjusted landing velocity.
    /// </summary>
    public Vector2 ProjectLandingVelocity(Vector2 airVelocity)
    {
        if (!preserveHorizontalOnLand)
            return new Vector2(0f, airVelocity.y);
        return new Vector2(airVelocity.x, airVelocity.y);
    }

    /// <summary>
    /// After a wall jump, blend the retained horizontal velocity with the new jump direction.
    /// </summary>
    public Vector2 WallJumpVelocity(Vector2 fromWall, Vector2 currentVel)
    {
        float retainedX = currentVel.x * wallJumpHorizontalRetention;
        return new Vector2(fromWall.x + retainedX, fromWall.y);
    }
}
