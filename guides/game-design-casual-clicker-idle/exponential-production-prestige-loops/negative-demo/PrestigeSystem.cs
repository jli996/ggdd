using UnityEngine;

// Anti-pattern: linear production scaling, no prestige system.
public class PrestigeSystem : MonoBehaviour
{
    public float baseProduction = 1f;
    public float perTierProductionIncrease = 1f; // Linear: adds flat amount per tier

    public float ProductionAtTier(int tier)
    {
        return baseProduction + tier * perTierProductionIncrease;
    }
}
