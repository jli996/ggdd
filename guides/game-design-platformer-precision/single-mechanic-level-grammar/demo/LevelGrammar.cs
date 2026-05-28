using UnityEngine;

public enum PlatformerMechanic { Walk, Jump, DoubleJump, Dash, WallJump, Crouch, GrappleHook }

[CreateAssetMenu(fileName = "LevelGrammar", menuName = "Game/Level Grammar")]
public class LevelGrammar : ScriptableObject
{
    [System.Serializable]
    public class LevelSpec
    {
        public string levelName;
        public PlatformerMechanic[] knownMechanics;
        public PlatformerMechanic[] newMechanicsIntroduced;
    }

    public LevelSpec[] levels;

    public bool IsValidGrammar()
    {
        if (levels == null) return false;
        foreach (var l in levels)
        {
            if (l.newMechanicsIntroduced != null && l.newMechanicsIntroduced.Length > 1) return false;
        }
        return true;
    }
}
