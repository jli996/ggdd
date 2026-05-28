using UnityEngine;
using System.Linq;

public enum Role { Tank, Assassin, Support, Marksman, Mage }

public class DraftSystem : MonoBehaviour
{
    [SerializeField] private int banCount = 5;
    [SerializeField] private int pickCount = 5;
    [SerializeField] private bool pickAfterBan = true;

    /// Returns true if the draft has at least 3 distinct roles represented.
    public bool IsValidDraft(Role[] picks)
    {
        if (picks == null || picks.Length == 0) return false;
        int distinctRoles = picks.Distinct().Count();
        return distinctRoles >= 3;
    }
}
