using UnityEngine;

public class ExtractionZone : MonoBehaviour
{
    [SerializeField] private float openWindowSeconds = 90f;
    [SerializeField] private float distanceFromSpawn = 500f;
    [SerializeField] private float lootRewardMultiplier = 1f;
    private float windowStartedAt = -1f;

    public bool IsOpen => windowStartedAt >= 0f && Time.time - windowStartedAt < openWindowSeconds;

    public void Open()
    {
        windowStartedAt = Time.time;
    }

    public float RewardForExtract(float baseLoot)
    {
        float distanceBias = Mathf.Clamp01(distanceFromSpawn / 1000f);
        return baseLoot * (lootRewardMultiplier + distanceBias);
    }
}
