using UnityEngine;
using System.Linq;

public enum BuildingArchetype { Economy, Tech, MilitaryRanged, MilitaryMelee, Defense }

public class BuildOrderScout : MonoBehaviour
{
    [SerializeField] private float scoutWindowSeconds = 30f;
    [SerializeField] private float buildingVisibilityRadius = 200f;

    /// Returns the dominant BuildingArchetype from scouted buildings (most frequent).
    public BuildingArchetype IdentifyStrategy(BuildingArchetype[] scoutedBuildings)
    {
        if (scoutedBuildings == null || scoutedBuildings.Length == 0)
            return BuildingArchetype.Economy;

        BuildingArchetype dominant = scoutedBuildings
            .GroupBy(a => a)
            .OrderByDescending(g => g.Count())
            .First().Key;

        return dominant;
    }
}
