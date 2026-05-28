using UnityEngine;

public class EconomySystem : MonoBehaviour
{
    // No loss bonus. No money cap. Huge per-kill reward (sandbagging incentive).
    [SerializeField] private int winBonus = 1000;
    [SerializeField] private int killReward = 2000;

    public int AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)
    {
        if (wonRound) currentMoney += winBonus;
        currentMoney += kills * killReward;
        return currentMoney;
    }
}
