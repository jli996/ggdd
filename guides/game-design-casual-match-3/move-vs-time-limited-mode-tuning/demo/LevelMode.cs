using UnityEngine;

[CreateAssetMenu(menuName = "Match3/LevelMode")]
public class LevelMode : ScriptableObject
{
    public enum ModeType { MoveLimited, TimeLimited }

    public enum ObjectiveType { ClearObstacles, CollectItems, ReachScore, DefeatBoss }

    [SerializeField] private ModeType mode = ModeType.MoveLimited;
    [SerializeField] private int moveCount = 25;
    [SerializeField] private float timeLimitSeconds = 90f;
    [SerializeField] private ObjectiveType objective;

    public string BudgetLabel()
    {
        if (mode == ModeType.MoveLimited)
            return $"{moveCount} moves";
        return $"{timeLimitSeconds} seconds";
    }
}
