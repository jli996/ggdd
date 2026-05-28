using UnityEngine;

public class InputBuffer : MonoBehaviour
{
    // No buffer at all — single-frame check.
    public bool TryConsumeJump()
    {
        return Input.GetButtonDown("Jump");
    }
}
