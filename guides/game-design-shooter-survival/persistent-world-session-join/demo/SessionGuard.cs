using UnityEngine;

public class SessionGuard : MonoBehaviour
{
    [SerializeField] private float logOffSeconds = 30f;
    [SerializeField] private float relogCooldownSeconds = 60f;
    private float logOffStartedAt = -1f;
    private float lastDisconnectAt = -1f;

    public bool IsLoggingOff => logOffStartedAt >= 0f;

    public void RequestLogOff()
    {
        logOffStartedAt = Time.time;
    }

    public bool CanCompleteLogOff()
    {
        return IsLoggingOff && Time.time - logOffStartedAt >= logOffSeconds;
    }

    public void OnDisconnect()
    {
        lastDisconnectAt = Time.time;
    }

    public bool CanRejoin()
    {
        if (lastDisconnectAt < 0f) return true;
        return Time.time - lastDisconnectAt >= relogCooldownSeconds;
    }
}
