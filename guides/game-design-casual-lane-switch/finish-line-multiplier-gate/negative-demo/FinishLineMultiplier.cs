using UnityEngine;

public class FinishLineMultiplier : MonoBehaviour
{
    // Flat reward, no gate concept, no multiplier.
    public int flatReward = 100;

    public int GetReward()
    {
        return flatReward;
    }
}
