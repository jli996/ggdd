using UnityEngine;

public enum CardRarity { Common, Uncommon, Rare }

[CreateAssetMenu(fileName = "Card", menuName = "Game/Card")]
public class CardData : ScriptableObject
{
    public string cardName;
    public CardRarity rarity;
    public int baseDamage = 6;

    // Power-creep: damage scales with rarity. Solved deck — always pick rares.
    public int Damage => rarity == CardRarity.Rare ? baseDamage * 2
                       : rarity == CardRarity.Uncommon ? baseDamage + 3
                       : baseDamage;
}
