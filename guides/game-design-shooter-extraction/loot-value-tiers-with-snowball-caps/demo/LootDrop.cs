using UnityEngine;

public enum LootTier { Common, Uncommon, Rare, Legendary }

public class LootDrop : MonoBehaviour
{
    [SerializeField] private float commonChance = 0.60f;
    [SerializeField] private float uncommonChance = 0.30f;
    [SerializeField] private float rareChance = 0.08f;
    [SerializeField] private float legendaryChance = 0.02f;
    [SerializeField] private int secureSlotCount = 2;

    public LootTier RollTier(float roll01)
    {
        if (roll01 < legendaryChance) return LootTier.Legendary;
        if (roll01 < legendaryChance + rareChance) return LootTier.Rare;
        if (roll01 < legendaryChance + rareChance + uncommonChance) return LootTier.Uncommon;
        return LootTier.Common;
    }

    public bool IsSecureSlot(int slotIndex)
    {
        return slotIndex < secureSlotCount;
    }
}
