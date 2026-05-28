using UnityEngine;

public class CrowdFormation : MonoBehaviour
{
    // No formation, single character, no add/remove units.
    public GameObject playerPrefab;

    public void SpawnPlayer()
    {
        Instantiate(playerPrefab, transform.position, Quaternion.identity);
    }
}
