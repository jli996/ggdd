using UnityEngine;

[CreateAssetMenu(fileName = "RaidConfig", menuName = "Game/Raid Config")]
public class RaidConfig : ScriptableObject
{
    [System.Serializable]
    public class MapTier
    {
        public string mapName;
        public float raidDurationMinutes;
        public int playerCount;
    }

    public MapTier shortRaid = new MapTier { mapName = "Customs", raidDurationMinutes = 20f, playerCount = 8 };
    public MapTier mediumRaid = new MapTier { mapName = "Woods", raidDurationMinutes = 40f, playerCount = 10 };
    public MapTier longRaid = new MapTier { mapName = "Streets", raidDurationMinutes = 75f, playerCount = 14 };
}
