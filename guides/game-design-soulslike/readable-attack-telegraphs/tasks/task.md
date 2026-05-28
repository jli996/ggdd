# Task

Implement `Assets/Scripts/EnemyAttackTelegraph.cs` as a MonoBehaviour. Provide:
- Serialized `windupSeconds` (in [0.5, 1.2]), `recoverySeconds` (>0), `staggerWindowSeconds` (in [0.1, 0.5]).
- `attackStartedAt` timestamp field.
- `StartTelegraph()` that records the start time.
- `IsAttacking()` returning true only when the attack's active phase is in progress (after windup, before windup+recovery end).
- `IsInStaggerWindow()` returning true only during the stagger window after recovery.
- `OnAttackComplete()` to reset attack state.
