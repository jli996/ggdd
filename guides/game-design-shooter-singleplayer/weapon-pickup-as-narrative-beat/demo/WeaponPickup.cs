using UnityEngine;

public enum StoryAct { Act1Intro, Act2Rising, Act3Climax, Act4Resolution }

[CreateAssetMenu(fileName = "WeaponPickup", menuName = "Game/Weapon Pickup")]
public class WeaponPickup : ScriptableObject
{
    public string weaponName;
    public StoryAct act;
    public int actMissionIndex;
    public bool isNarrativeBeat;
}
