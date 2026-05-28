using UnityEngine;

public class LootDecay : MonoBehaviour
{
    [SerializeField] private float decayPerUse = 0.02f;
    [SerializeField] private int vaultMaxItems = 32;
    [SerializeField] private float raidWindowStartHour = 18f;
    [SerializeField] private float raidWindowDurationHours = 4f;

    public float ApplyDurabilityLoss(float currentDurability)
    {
        return Mathf.Max(0f, currentDurability - decayPerUse);
    }

    public bool CanAddToVault(int currentVaultCount)
    {
        return currentVaultCount < vaultMaxItems;
    }

    public bool IsRaidWindowOpen(float serverHour)
    {
        return serverHour >= raidWindowStartHour
            && serverHour < raidWindowStartHour + raidWindowDurationHours;
    }
}
