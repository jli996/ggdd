using UnityEngine;

public class BuildQueue : MonoBehaviour
{
    [System.Serializable]
    public class BuildOrder
    {
        public string buildingType;
        public float secondsToComplete;
        public float queuedAtRealTime;
    }

    [SerializeField] private BuildOrder[] queue;
    [SerializeField] private int maxQueueSlots = 3;
    [SerializeField] private float offlineProgressMultiplier = 1.0f;

    /// Returns how many queued buildings have completed by currentRealTime.
    public int CompletedBuildings(float currentRealTime)
    {
        if (queue == null) return 0;
        int completed = 0;
        float elapsed = 0f;
        foreach (var order in queue)
        {
            float startTime = order.queuedAtRealTime + elapsed;
            float finishTime = startTime + order.secondsToComplete / offlineProgressMultiplier;
            if (currentRealTime >= finishTime) completed++;
            elapsed += order.secondsToComplete / offlineProgressMultiplier;
        }
        return completed;
    }
}
