using UnityEngine;

public class InputBuffer : MonoBehaviour
{
    [SerializeField] private float bufferWindow = 0.15f;
    private float bufferedAt = -1f;

    public void OnJumpPressed()
    {
        bufferedAt = Time.time;
    }

    public bool TryConsumeJump()
    {
        if (bufferedAt < 0f) return false;
        if (Time.time - bufferedAt > bufferWindow) return false;
        bufferedAt = -1f;
        return true;
    }
}
