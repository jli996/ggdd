# Expectations: gc-free-update-loop

After applying this guide, the agent's `Assets/Scripts/EnemyAI.cs` should:

1. Cache `GetComponent<...>()` results in a field (assigned in `Awake`/`Start`), not call them in `Update`/`FixedUpdate`.
2. Not allocate `new List<...>`, `new ...[]`, or `new Dictionary<...>` inside `Update`/`FixedUpdate`/`LateUpdate`.
3. Not import `System.Linq`.
4. Use `*NonAlloc` Physics overloads (e.g. `OverlapCircleNonAlloc`) over allocating ones.
5. Not call `Debug.Log` inside `FixedUpdate` (cheap source of allocations + string formatting).
