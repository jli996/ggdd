using UnityEngine;

public class EsportsReadability : MonoBehaviour
{
    [SerializeField] private Color teamAColor = Color.cyan;
    [SerializeField] private Color teamBColor = Color.red;
    [SerializeField] private float killFeedPersistSeconds = 5f;
    [SerializeField] private bool observerModeEnabled = true;
    [SerializeField] private bool observerHidesHud = true;

    public float TeamColorContrast()
    {
        return Vector3.Distance(
            new Vector3(teamAColor.r, teamAColor.g, teamAColor.b),
            new Vector3(teamBColor.r, teamBColor.g, teamBColor.b));
    }

    public bool IsKillFeedReadable() => killFeedPersistSeconds >= 3f && killFeedPersistSeconds <= 10f;
    public bool IsObserverModeReady() => observerModeEnabled && observerHidesHud;
}
