using UnityEngine;

public class Generator : MonoBehaviour
{
    // Infinite spawning, no energy system, no regen, no cap.
    public GameObject itemPrefab;

    public void Spawn()
    {
        Instantiate(itemPrefab, transform.position, Quaternion.identity);
    }
}
