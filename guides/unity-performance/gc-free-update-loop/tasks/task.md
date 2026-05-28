# Task

`Assets/Scripts/EnemyAI.cs` allocates several objects every `FixedUpdate` call (a new `List<Transform>`, a `Physics2D.OverlapCircle` array, a `GetComponent<Rigidbody2D>` lookup, and a `Debug.Log` with string formatting). Refactor it to be GC-free in the hot path: pre-allocate persistent fields in `Awake`, reuse them in `FixedUpdate`, switch to `OverlapCircleNonAlloc`, and remove the `Debug.Log`.
