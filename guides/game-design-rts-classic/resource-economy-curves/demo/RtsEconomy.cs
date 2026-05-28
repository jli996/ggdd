using UnityEngine;

public class RtsEconomy : MonoBehaviour
{
    [SerializeField] private float mineralsPerWorkerPerSecond = 0.6f;
    [SerializeField] private int workersCapPerExpansion = 16;
    [SerializeField] private float expansionCostMineralsBase = 400f;
    [SerializeField] private float expansionCostScaling = 1.5f;

    /// Returns effective minerals/second capped by worker saturation per expansion.
    public float EconomicCapacity(int expansionCount, int totalWorkers)
    {
        int cap = expansionCount * workersCapPerExpansion;
        int effectiveWorkers = Mathf.Min(totalWorkers, cap);
        return effectiveWorkers * mineralsPerWorkerPerSecond;
    }

    /// Returns cost of the next expansion using exponential scaling.
    public float ExpansionCost(int existingExpansions)
    {
        return expansionCostMineralsBase * Mathf.Pow(expansionCostScaling, existingExpansions);
    }
}
