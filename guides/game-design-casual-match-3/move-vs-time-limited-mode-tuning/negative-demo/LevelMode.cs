using UnityEngine;

public class LevelMode : MonoBehaviour
{
    // No mode distinction, only moveCount. No timer, no objective type.
    public int moveCount = 20;

    public string BudgetLabel()
    {
        return $"{moveCount} moves";
    }
}
