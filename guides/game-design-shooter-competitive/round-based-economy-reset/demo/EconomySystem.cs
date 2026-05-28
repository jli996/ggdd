using UnityEngine;

public class EconomySystem : MonoBehaviour
{
    [SerializeField] private int startingMoney = 800;
    [SerializeField] private int winBonus = 3500;
    [SerializeField] private int baseLossBonus = 1400;
    [SerializeField] private int lossStreakIncrement = 500;
    [SerializeField] private int maxLossBonus = 3400;
    [SerializeField] private int killReward = 300;
    [SerializeField] private int moneyCap = 16000;

    public int LossBonusForStreak(int consecutiveLosses)
    {
        int bonus = baseLossBonus + Mathf.Max(0, consecutiveLosses - 1) * lossStreakIncrement;
        return Mathf.Min(bonus, maxLossBonus);
    }

    public int AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)
    {
        int reward = wonRound ? winBonus : LossBonusForStreak(consecutiveLosses);
        reward += kills * killReward;
        return Mathf.Min(currentMoney + reward, moneyCap);
    }
}
