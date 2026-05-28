using UnityEngine;

public enum RelicHook { OnTurnStart, OnDamageTaken, OnCardPlayed, OnRest, OnRoomCleared }

[CreateAssetMenu(fileName = "Relic", menuName = "Game/Relic")]
public class RelicData : ScriptableObject
{
    public string relicName;
    public RelicHook hook;
    [TextArea] public string tooltip;
    public int effectMagnitude = 1;
}
