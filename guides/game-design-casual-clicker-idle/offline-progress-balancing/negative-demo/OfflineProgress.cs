using UnityEngine;

// Anti-pattern: offline produces at full rate, no time cap.
public class OfflineProgress : MonoBehaviour
{
    public float lastOnlineTimestamp;

    public float OfflineEarnings(float currentRate, float now)
    {
        float elapsed = now - lastOnlineTimestamp;
        return currentRate * elapsed; // No multiplier, no cap — infinite offline farming
    }
}
