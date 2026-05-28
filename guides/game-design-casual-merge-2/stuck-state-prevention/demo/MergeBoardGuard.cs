using UnityEngine;

public class MergeBoardGuard : MonoBehaviour
{
    [SerializeField] private int boardCapacity = 36;
    [SerializeField] private int spawnReservedSlots = 4;
    [SerializeField] private float idleItemDespawnSeconds = 600f;
    [SerializeField] private bool sellEnabled = true;

    public bool CanAcceptSpawn(int currentItemCount)
    {
        return currentItemCount + spawnReservedSlots <= boardCapacity;
    }

    public bool WouldBeStuck(int currentItemCount, int pendingMergeCount)
    {
        return currentItemCount >= boardCapacity && pendingMergeCount == 0;
    }
}
