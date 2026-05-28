using UnityEngine;

[CreateAssetMenu(fileName = "CollectibleLayout", menuName = "Game/Collectible Layout")]
public class CollectibleLayout : ScriptableObject
{
    [System.Serializable]
    public class CollectibleClump
    {
        public string roomName;
        public int count;               // number of collectibles in this clump (> 1 for a meaningful beat)
        public string requiresAbility;  // e.g. "DoubleJump", "" for always accessible
    }

    public CollectibleClump[] clumps;

    public int TotalCollectibles()
    {
        if (clumps == null) return 0;
        int total = 0;
        foreach (var c in clumps) total += c.count;
        return total;
    }

    public bool IsRoomEmpty(string roomName)
    {
        if (clumps == null) return true;
        foreach (var c in clumps)
        {
            if (c.roomName == roomName && c.count > 0) return false;
        }
        return true;
    }
}
