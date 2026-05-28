using UnityEngine;

public class RespawnSystem : MonoBehaviour
{
    [SerializeField] private float respawnDelaySeconds = 0.4f;
    [SerializeField] private Transform currentCheckpoint;
    [SerializeField] private int deathCount = 0;
    [SerializeField] private float runStartedAt;

    public void OnPlayerDeath(Transform player)
    {
        deathCount++;
        Invoke(nameof(RespawnPlayer), respawnDelaySeconds);
    }

    private void RespawnPlayer() { }

    public void SetCheckpoint(Transform t) { currentCheckpoint = t; }
}
