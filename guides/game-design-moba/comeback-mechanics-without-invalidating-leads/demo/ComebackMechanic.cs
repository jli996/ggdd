using UnityEngine;

public class ComebackMechanic : MonoBehaviour
{
    [SerializeField] private float baseBountyGold = 300f;
    [SerializeField] private float bountyScalingPerKgoldDeficit = 80f;
    [SerializeField] private float maxBountyGold = 1200f;
    [SerializeField] private float neutralObjectiveBoostMaxPercent = 0.30f;

    /// Returns kill bounty gold for the losing team's killer, capped at maxBountyGold.
    public float BountyForKill(float losingTeamGold, float winningTeamGold)
    {
        float deficitKGold = Mathf.Max(0f, (winningTeamGold - losingTeamGold) / 1000f);
        float bounty = baseBountyGold + bountyScalingPerKgoldDeficit * deficitKGold;
        return Mathf.Min(bounty, maxBountyGold);
    }
}
