using UnityEngine;

public enum ZoneTier { Coastal, MidInland, HighRisk }

public class EncounterBalance : MonoBehaviour
{
    [SerializeField] private float nakedDamageSoftCap = 30f;
    [SerializeField] private ZoneTier currentZone = ZoneTier.Coastal;

    public float ScaleDamageToTarget(float baseDamage, bool targetIsNaked)
    {
        if (targetIsNaked) return Mathf.Min(baseDamage, nakedDamageSoftCap);
        return baseDamage;
    }

    public float ZoneLootMultiplier()
    {
        return currentZone switch
        {
            ZoneTier.Coastal => 0.3f,
            ZoneTier.MidInland => 1.0f,
            ZoneTier.HighRisk => 2.5f,
            _ => 1.0f,
        };
    }
}
