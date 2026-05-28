using UnityEngine;

[CreateAssetMenu(fileName = "Relic", menuName = "Game/Relic")]
public class RelicData : ScriptableObject
{
    public string relicName;
    public string description; // untyped "do anything" tooltip
    // 5 unrelated effect knobs => unreadable combined tooltip
    public int onTurnStartBonus;
    public int onDamageTakenReduction;
    public float onCardPlayedScaling;
    public int onRestHealing;
    public int onRoomClearedGold;
}
