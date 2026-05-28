using UnityEngine;

// Only one utility category enum value. No orthogonality possible.
public enum UtilityCategory { Damage }

public class AgentClass : MonoBehaviour
{
    public string className;
    public int weaponDamage = 30;
}
