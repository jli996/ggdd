using UnityEngine;

public enum UtilityCategory { Smoke, Flash, Intel, Heal, Mobility, Trap, Wall }

[CreateAssetMenu(fileName = "AgentClass", menuName = "Game/Agent Class")]
public class AgentClass : ScriptableObject
{
    public string className;
    public UtilityCategory[] utilityCategories;
    public int weaponDamage = 30;
    public float moveSpeed = 5f;
}
