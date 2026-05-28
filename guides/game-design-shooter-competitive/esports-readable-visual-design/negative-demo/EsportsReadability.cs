using UnityEngine;

public class EsportsReadability : MonoBehaviour
{
    // Both teams red. Kill feed flashes for 1s. No observer mode.
    [SerializeField] private Color teamAColor = Color.red;
    [SerializeField] private Color teamBColor = Color.red;
    [SerializeField] private float killFeedPersistSeconds = 1f;
}
