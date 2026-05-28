using UnityEngine;

public class SpecialTileFactory : MonoBehaviour
{
    // No enums, no thresholds, every match creates the same generic "bonus" tile.
    public string CreateSpecial()
    {
        return "bonus";
    }
}
