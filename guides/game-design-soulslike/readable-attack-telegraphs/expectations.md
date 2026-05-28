# Expectations: readable-attack-telegraphs

After applying this guide, the agent's `Assets/Scripts/EnemyAttackTelegraph.cs` should:

1. Have a serialized `windupSeconds` field in [0.5, 1.2].
2. Have a serialized `recoverySeconds` field greater than 0.
3. Have a serialized `staggerWindowSeconds` field in [0.1, 0.5].
4. Expose `StartTelegraph()` to begin the attack sequence.
5. Expose `IsAttacking()` returning true only during the active hitbox phase (after windup, within recovery window).
6. Expose `IsInStaggerWindow()` returning true only during the stagger phase after recovery.
7. Track an `attackStartedAt` timestamp to enable phase queries.
