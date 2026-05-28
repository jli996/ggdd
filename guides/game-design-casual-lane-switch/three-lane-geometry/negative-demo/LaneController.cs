using UnityEngine;

public class LaneController : MonoBehaviour
{
    // Continuous (non-snapping) horizontal movement, no lane concept.
    public float moveSpeed = 5f;

    public void MoveLeft()
    {
        transform.position += Vector3.left * moveSpeed * Time.deltaTime;
    }

    public void MoveRight()
    {
        transform.position += Vector3.right * moveSpeed * Time.deltaTime;
    }
}
