using UnityEngine;

[System.Serializable]
public class EnemyWave
{
    public string[] enemyTypes;
    public int totalEnemyCount;
    public float intensityCurve;
}

public class CombatEncounter : MonoBehaviour
{
    [SerializeField] private EnemyWave[] waves;
    [SerializeField] private int ammoDropMin = 20;
    [SerializeField] private int ammoDropMax = 60;
    [SerializeField] private float postEncounterHealthFraction = 0.7f;

    public bool IsValid()
    {
        if (waves == null || waves.Length < 2) return false;
        foreach (var w in waves)
        {
            if (w.enemyTypes == null || w.enemyTypes.Length < 2) return false;
        }
        return true;
    }
}
