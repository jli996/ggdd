using UnityEngine;

[CreateAssetMenu(fileName = "RunActConfig", menuName = "Game/Run Act Config")]
public class RunActConfig : ScriptableObject
{
    [System.Serializable]
    public class Act
    {
        public int normalEncounterCount = 7;
        public int eliteCount = 2;
        public int restSiteCount = 2;
    }

    public Act act1 = new Act { normalEncounterCount = 7, eliteCount = 1, restSiteCount = 2 };
    public Act act2 = new Act { normalEncounterCount = 9, eliteCount = 3, restSiteCount = 2 };
    public Act act3 = new Act { normalEncounterCount = 7, eliteCount = 2, restSiteCount = 1 };
}
