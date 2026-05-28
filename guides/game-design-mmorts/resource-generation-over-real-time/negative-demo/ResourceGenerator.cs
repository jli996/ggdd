using UnityEngine;

public class ResourceGenerator : MonoBehaviour
{
    private float wood = 0f;

    // Anti-pattern: resources generated only in Update (requires player to be online).
    // No storage cap, no per-hour rates, uncapped accumulation.
    void Update()
    {
        wood += 10f * Time.deltaTime;
    }
}
