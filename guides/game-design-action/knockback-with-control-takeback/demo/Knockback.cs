using UnityEngine;

public class Knockback : MonoBehaviour
{
    [SerializeField] private float lockoutDuration = 0.18f;
    [SerializeField] private Rigidbody2D rb;
    private float lockoutEndsAt = -1f;

    public bool IsLockedOut => Time.time < lockoutEndsAt;

    public void ApplyHit(Vector2 impulse)
    {
        rb.AddForce(impulse, ForceMode2D.Impulse);
        lockoutEndsAt = Time.time + lockoutDuration;
    }
}
