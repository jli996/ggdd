using UnityEngine;

public class MomentumTransitions : MonoBehaviour
{
    // No retention fields — always zeroes horizontal velocity on transition
    public Vector2 ProjectLandingVelocity(Vector2 airVelocity)
    {
        return new Vector2(0f, 0f); // kills all momentum
    }

    public void OnWallJump()
    {
        // No horizontal retention logic
    }
}
