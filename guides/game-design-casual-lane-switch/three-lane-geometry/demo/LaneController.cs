using UnityEngine;

public class LaneController : MonoBehaviour
{
    [SerializeField] private int laneCount = 3;
    [SerializeField] private float laneWidthMeters = 2.5f;
    [SerializeField] private float swipeMinDistancePx = 50f;

    private int currentLane = 1;
    private int targetLane = 1;

    public void OnSwipe(float deltaX)
    {
        if (Mathf.Abs(deltaX) < swipeMinDistancePx) return;
        if (deltaX < 0)
            targetLane = Mathf.Max(0, currentLane - 1);
        else
            targetLane = Mathf.Min(laneCount - 1, currentLane + 1);
        currentLane = targetLane;
    }

    public bool IsValidLaneCount()
    {
        return laneCount == 3;
    }
}
