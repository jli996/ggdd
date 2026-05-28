using UnityEngine;

public class CollectathonCamera : MonoBehaviour
{
    public Transform target;

    private void LateUpdate()
    {
        // Hardcoded follow — always centers on player, no orbit, no yield to player input
        if (target != null)
            transform.LookAt(target);
    }
}
