using UnityEngine;

public enum LootTier { Common, Legendary }

public class LootDrop : MonoBehaviour
{
    public LootTier RollTier(float roll01)
    {
        return roll01 < 0.5f ? LootTier.Legendary : LootTier.Common;
    }
}
