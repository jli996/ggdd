using UnityEngine;

public class OfflineProgress : MonoBehaviour
{
    [SerializeField] private float offlineProductionMultiplier = 0.40f;
    [SerializeField] private float maxOfflineHours = 8f;
    [SerializeField] private float lastOnlineTimestamp;

    public float OfflineEarnings(float currentRate, float now)
    {
        float elapsed       = now - lastOnlineTimestamp;
        float cappedSeconds = Mathf.Min(elapsed, maxOfflineHours * 3600f);
        return currentRate * offlineProductionMultiplier * cappedSeconds;
    }

    private void OnApplicationPause(bool paused)
    {
        if (paused) lastOnlineTimestamp = Time.realtimeSinceStartup;
    }
}
