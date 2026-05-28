using UnityEngine;

public enum UnitType { Infantry, Cavalry, Spear, Archer, Mage }

[CreateAssetMenu(menuName = "GGDD/UnitCounters")]
public class UnitCounters : ScriptableObject
{
    [System.Serializable]
    public class CounterRelation
    {
        public UnitType attacker;
        public UnitType victim;
        public float damageMultiplier;
    }

    [SerializeField] private CounterRelation[] relations = new CounterRelation[]
    {
        new CounterRelation { attacker = UnitType.Cavalry, victim = UnitType.Archer,   damageMultiplier = 1.5f },
        new CounterRelation { attacker = UnitType.Spear,   victim = UnitType.Cavalry,  damageMultiplier = 1.5f },
        new CounterRelation { attacker = UnitType.Archer,  victim = UnitType.Spear,    damageMultiplier = 1.35f },
        new CounterRelation { attacker = UnitType.Mage,    victim = UnitType.Infantry, damageMultiplier = 1.4f },
    };

    public float DamageMultiplier(UnitType atk, UnitType victim)
    {
        foreach (var r in relations)
        {
            if (r.attacker == atk && r.victim == victim)
                return r.damageMultiplier;
        }
        return 1.0f;
    }
}
