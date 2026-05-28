using UnityEngine;

public class Knockback : MonoBehaviour
{
    [SerializeField] private float lockoutDuration = 0.8f; // way too long
    [SerializeField] private Rigidbody2D rb;

    public void ApplyHit(Vector2 impulse)
    {
        rb.AddForce(impulse, ForceMode2D.Impulse);
        // No IsLockedOut exposed; consumers can't read state.
    }
}
