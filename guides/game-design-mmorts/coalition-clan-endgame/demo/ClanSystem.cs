using UnityEngine;

[CreateAssetMenu(menuName = "GGDD/ClanSystem")]
public class ClanSystem : ScriptableObject
{
    [System.Serializable]
    public class ClanBonus
    {
        public int clanSize;
        public float bonusMultiplier;
    }

    [SerializeField] private int soloProgressionCap = 50;
    [SerializeField] private int clanMaxLevel = 100;
    [SerializeField] private ClanBonus[] bonuses;

    public int MaxAchievableLevel(bool inClan)
    {
        return inClan ? clanMaxLevel : soloProgressionCap;
    }
}
