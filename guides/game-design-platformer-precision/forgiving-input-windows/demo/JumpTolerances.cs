using UnityEngine;

public class JumpTolerances : MonoBehaviour
{
    [SerializeField] private float coyoteTimeSeconds = 0.10f;
    [SerializeField] private float jumpBufferSeconds = 0.15f;
    [SerializeField] private float fullJumpVelocity = 12f;
    [SerializeField] private float shortHopMultiplier = 0.45f;

    private float lastGroundedAt = -1f;
    private float lastJumpPressedAt = -1f;

    public void OnGrounded() { lastGroundedAt = Time.time; }
    public void OnJumpPressed() { lastJumpPressedAt = Time.time; }

    public bool CanJump()
    {
        bool coyoteOk = Time.time - lastGroundedAt <= coyoteTimeSeconds;
        bool bufferedOk = Time.time - lastJumpPressedAt <= jumpBufferSeconds;
        return coyoteOk && bufferedOk;
    }

    public float ComputeJumpVelocity(bool held)
    {
        return held ? fullJumpVelocity : fullJumpVelocity * shortHopMultiplier;
    }
}
