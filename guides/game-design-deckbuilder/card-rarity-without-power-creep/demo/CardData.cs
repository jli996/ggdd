using UnityEngine;

public enum CardRarity { Common, Uncommon, Rare }

[CreateAssetMenu(fileName = "Card", menuName = "Game/Card")]
public class CardData : ScriptableObject
{
    public string cardName;
    public CardRarity rarity = CardRarity.Common;
    public int energyCost = 1;
    public int baseDamage = 6;
    public string[] effects;
}
