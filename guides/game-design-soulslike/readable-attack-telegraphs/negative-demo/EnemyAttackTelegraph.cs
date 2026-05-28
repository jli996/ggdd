using UnityEngine;

// Anti-pattern: no windup timing, no stagger window, no phase tracking.
public class EnemyAttackTelegraph : MonoBehaviour
{
    public void Attack()
    {
        // Instantly applies damage — no telegraph, no recovery window.
        Debug.Log("enemy attacks");
    }
}
