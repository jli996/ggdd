using UnityEngine;

public class SessionGuard : MonoBehaviour
{
    // No timers. Logout despawns immediately; relog allowed instantly.
    public void RequestLogOff()
    {
        Destroy(gameObject);
    }
}
