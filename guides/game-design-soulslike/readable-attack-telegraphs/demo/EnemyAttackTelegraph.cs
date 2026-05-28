using UnityEngine;

public class EnemyAttackTelegraph : MonoBehaviour
{
    [SerializeField] private float windupSeconds = 0.7f;
    [SerializeField] private float recoverySeconds = 0.4f;
    [SerializeField] private float staggerWindowSeconds = 0.3f;

    private float attackStartedAt = -999f;
    private bool attacking = false;

    public void StartTelegraph()
    {
        attackStartedAt = Time.time;
        attacking = true;
    }

    public bool IsAttacking()
    {
        if (!attacking) return false;
        float elapsed = Time.time - attackStartedAt;
        // Active attack phase begins after windup; ends after windup + recovery.
        return elapsed >= windupSeconds && elapsed < windupSeconds + recoverySeconds;
    }

    public bool IsInStaggerWindow()
    {
        if (!attacking) return false;
        float elapsed = Time.time - attackStartedAt;
        float staggerStart = windupSeconds + recoverySeconds;
        return elapsed >= staggerStart && elapsed < staggerStart + staggerWindowSeconds;
    }

    public void OnAttackComplete()
    {
        attacking = false;
    }
}
