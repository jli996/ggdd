using UnityEngine;

public class AnticipatoryCamera : MonoBehaviour
{
    // Center-locked camera — no lead offset, no speed-awareness
    public Transform target;

    private void LateUpdate()
    {
        if (target != null)
            transform.position = new Vector3(target.position.x, target.position.y, transform.position.z);
    }
}
