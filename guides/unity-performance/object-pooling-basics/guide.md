---
id: object-pooling-basics
category: unity-performance
title: Object pooling with UnityEngine.Pool (Unity 6)
description: Pool frequently spawned and destroyed objects (bullets, particles, enemies) using UnityEngine.Pool.ObjectPool to avoid Instantiate/Destroy cost.
useCases:
  - "pool bullets in Unity"
  - "avoid Destroy and Instantiate cost"
  - "reuse spawned objects"
  - "ObjectPool for particles"
  - "fix spawn / despawn frame drops"
relatedGuides:
  - gc-free-update-loop
appliesTo:
  - "any spawner that creates / destroys objects more than ~10/sec"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Object pooling with UnityEngine.Pool

`Instantiate` and `Destroy` are expensive: Instantiate allocates and serializes prefab state; Destroy schedules teardown that defers GC. For anything spawned frequently (bullets, particles, hit-flash sprites, enemies in waves), use Unity 6's built-in `UnityEngine.Pool.ObjectPool<T>`.

## Pool reusable instances

```csharp
using UnityEngine;
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet bulletPrefab;
    private ObjectPool<Bullet> pool;

    void Awake()
    {
        pool = new ObjectPool<Bullet>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: b => b.gameObject.SetActive(true),
            actionOnRelease: b => b.gameObject.SetActive(false),
            actionOnDestroy: b => Destroy(b.gameObject),
            defaultCapacity: 32,
            maxSize: 256);
    }

    public void Fire(Vector3 from, Vector3 dir)
    {
        var b = pool.Get();
        b.Launch(from, dir, onExpire: () => pool.Release(b));
    }
}
```

## Avoid

- Bare `Instantiate(prefab)` followed by `Destroy(go)` for short-lived objects.
- Hand-rolled pools (`Stack<T>`, `Queue<T>`) — `UnityEngine.Pool.ObjectPool<T>` is dependency-free, threadsafe-on-the-main-thread, and has built-in capacity controls.
- Pooling objects with active subscriptions/coroutines without resetting state on `Get` and unsubscribing on `Release`.

## Gotchas

- Pooled objects retain field values between uses — explicitly reset transient state in `actionOnGet`.
- `Destroy()` of a pooled object that's been Released and then `Destroy`d twice will throw. Track ownership.
- The pool's `maxSize` bounds memory, but oversized pools defeat the purpose. Profile your peak count, then add ~20% headroom.
