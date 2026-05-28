using UnityEngine;

public enum SetPieceType { Chase, Defend, Ambush, Vehicle, Sandbox, Stealth }

[CreateAssetMenu(fileName = "SetPieceCadence", menuName = "Game/Set-Piece Cadence")]
public class SetPieceCadence : ScriptableObject
{
    [System.Serializable]
    public class CadenceEntry
    {
        public SetPieceType type;
        public float minutesIntoMission;
        public float durationMinutes;
    }

    [SerializeField] private CadenceEntry[] cadence;
    [SerializeField] private float targetSpacingMinutes = 25f;

    public bool IsValidCadence()
    {
        if (cadence == null || cadence.Length < 2) return false;
        for (int i = 1; i < cadence.Length; i++)
        {
            float gap = cadence[i].minutesIntoMission - cadence[i - 1].minutesIntoMission;
            if (gap < targetSpacingMinutes / 2f) return false;
        }
        return true;
    }
}
