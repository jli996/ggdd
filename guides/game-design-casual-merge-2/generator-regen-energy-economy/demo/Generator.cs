using UnityEngine;

public class Generator : MonoBehaviour
{
    [SerializeField] private float energyPerItemCost = 1f;
    [SerializeField] private float energyRegenSecondsPerUnit = 180f;
    [SerializeField] private int energyMaxCap = 100;
    [SerializeField] private float regenStartedAt;

    public float CurrentEnergy(float storedEnergyAtStart, float now)
    {
        float elapsed = now - regenStartedAt;
        float regenerated = elapsed / energyRegenSecondsPerUnit;
        return Mathf.Min(storedEnergyAtStart + regenerated, energyMaxCap);
    }

    public bool TrySpawnItem(out float remainingEnergy, float currentEnergy)
    {
        if (currentEnergy >= energyPerItemCost)
        {
            remainingEnergy = currentEnergy - energyPerItemCost;
            return true;
        }
        remainingEnergy = currentEnergy;
        return false;
    }
}
