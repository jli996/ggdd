using UnityEngine;

public class BottlePour : MonoBehaviour
{
    // Allows any pour, ignores color match, no capacity check.
    public bool CanPour()
    {
        return true;
    }

    public int HowMuchPours()
    {
        return 1;
    }
}
