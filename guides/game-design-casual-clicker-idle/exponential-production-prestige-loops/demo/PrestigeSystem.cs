using UnityEngine;

public class PrestigeSystem : MonoBehaviour
{
    [SerializeField] private float baseProduction = 1f;
    [SerializeField] private float perTierProductionMultiplier = 2f;
    [SerializeField] private float prestigeBoostPerPoint = 0.10f;

    public float ProductionAtTier(int tier, int prestigePoints)
    {
        float tierBoost   = Mathf.Pow(perTierProductionMultiplier, tier);
        float prestigeMod = 1f + prestigePoints * prestigeBoostPerPoint;
        return baseProduction * tierBoost * prestigeMod;
    }

    public int PrestigePointsEarned(float totalLifetimeProduction)
    {
        return Mathf.FloorToInt(Mathf.Sqrt(totalLifetimeProduction / 1000f));
    }
}
