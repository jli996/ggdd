using UnityEngine;

public class JumpTolerances : MonoBehaviour
{
    [SerializeField] private float fullJumpVelocity = 12f;
    public float ComputeJumpVelocity() => fullJumpVelocity;  // no variable height
}
