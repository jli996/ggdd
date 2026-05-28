---
id: gc-free-update-loop
category: unity-performance
title: GC-free Update() loops (Unity 6)
description: Prevent per-frame heap allocations in hot paths to avoid GC spikes that cause frame hitches.
useCases:
  - "avoid GC spikes in Unity Update"
  - "fix frame stutters from allocations"
  - "remove LINQ from hot paths"
  - "stop allocating new lists every frame"
  - "cache GetComponent results"
relatedGuides:
  - object-pooling-basics
appliesTo:
  - "MonoBehaviour scripts in hot paths (Update, FixedUpdate, LateUpdate)"
gradeMode: static+unity
unityVersion: "6000.0"
baseApp: empty-unity6
---

# GC-free Update() loops

Every per-frame heap allocation in a hot Unity script feeds the garbage collector. Eventually the collector pauses the main thread to compact memory — a "GC spike" that causes a noticeable frame hitch.

The fix is to never allocate inside `Update`/`FixedUpdate`/`LateUpdate`. Move allocations to `Awake`/`Start`/`OnEnable` and reuse the references.

## Cache component lookups and collections

```csharp
using UnityEngine;
using System.Collections.Generic;

public class EnemyAI : MonoBehaviour
{
    private Rigidbody2D rb;
    private readonly List<Transform> nearby = new List<Transform>(16);
    private readonly Collider2D[] hits = new Collider2D[8];

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void FixedUpdate()
    {
        int count = Physics2D.OverlapCircleNonAlloc(transform.position, 5f, hits);
        nearby.Clear();
        for (int i = 0; i < count; i++) nearby.Add(hits[i].transform);
        Decide(nearby);
    }

    void Decide(List<Transform> _) {}
}
```

## Avoid

- `GetComponent<T>()` inside `Update` — cache it in `Awake`.
- `new List<T>()`, `new T[]`, `new Vector3[]` in hot paths — pre-allocate as fields.
- `Physics.OverlapSphere` / `OverlapCircle` (allocating overloads) — use the `*NonAlloc` variants.
- `System.Linq` (`Where`, `Select`, `ToList`) — allocates enumerators and lambdas per call.
- Boxing: `Debug.Log(intValue)` boxes; format strings allocate. Wrap in `if (Debug.isDebugBuild)` and use `Debug.Log($"x: {x}")` only off the hot path.

## Gotchas

- `string` concatenation (`"x: " + x`) allocates. Use `StringBuilder` if needed off hot path, or skip the log.
- `foreach` over a `List<T>` is fine in Unity 6 (allocations were fixed years ago), but `foreach` over a non-generic `IEnumerable` allocates an enumerator object.
- `Coroutine` `WaitForSeconds(0.1f)` allocates each `yield`. Cache it: `private readonly WaitForSeconds _wait01 = new WaitForSeconds(0.1f);`.
