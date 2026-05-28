using UnityEngine;

[CreateAssetMenu(fileName = "BonfireShortcut", menuName = "Game/Bonfire Shortcut")]
public class BonfireShortcut : ScriptableObject
{
    [System.Serializable]
    public class Bonfire
    {
        public string id;
        public string displayName;
        public string[] unlockShortcuts;  // shortcut IDs unlocked when this bonfire is lit
    }

    [System.Serializable]
    public class Shortcut
    {
        public string shortcutId;
        public string fromBonfireId;
        public string toBonfireId;
        public bool twoWay;  // true = unlocks travel in both directions
    }

    public Bonfire[] bonfires;
    public Shortcut[] shortcuts;

    public bool IsUnlockedShortcut(string shortcutId)
    {
        if (shortcuts == null || bonfires == null) return false;
        foreach (var bonfire in bonfires)
        {
            if (bonfire.unlockShortcuts == null) continue;
            foreach (var id in bonfire.unlockShortcuts)
            {
                if (id == shortcutId) return true;
            }
        }
        return false;
    }

    public Shortcut GetShortcut(string shortcutId)
    {
        if (shortcuts == null) return null;
        foreach (var s in shortcuts)
        {
            if (s.shortcutId == shortcutId) return s;
        }
        return null;
    }
}
