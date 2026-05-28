using UnityEngine;

public enum PlayerAbility { None, DoubleJump, Dash, Glide, WallJump, Swim }

[CreateAssetMenu(fileName = "WorldStructure", menuName = "Game/World Structure")]
public class WorldStructure : ScriptableObject
{
    [System.Serializable]
    public class SubWorld
    {
        public string worldName;
        public PlayerAbility unlockedByAbility;   // ability required to enter (None = always open)
        public int internalCollectibles;          // how many collectibles live in this world
    }

    public SubWorld hub;        // the hub world itself
    public SubWorld[] subWorlds;

    /// <summary>Returns true if the player has the ability required to access this world.</summary>
    public bool CanAccess(SubWorld world, PlayerAbility[] playerAbilities)
    {
        if (world == null) return false;
        if (world.unlockedByAbility == PlayerAbility.None) return true;
        if (playerAbilities == null) return false;
        foreach (var ability in playerAbilities)
        {
            if (ability == world.unlockedByAbility) return true;
        }
        return false;
    }

    /// <summary>Returns all sub-worlds accessible given the player's current abilities.</summary>
    public SubWorld[] AccessibleWorlds(PlayerAbility[] playerAbilities)
    {
        if (subWorlds == null) return System.Array.Empty<SubWorld>();
        var result = new System.Collections.Generic.List<SubWorld>();
        foreach (var w in subWorlds)
        {
            if (CanAccess(w, playerAbilities)) result.Add(w);
        }
        return result.ToArray();
    }
}
