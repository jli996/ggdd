# Task

`Assets/Scripts/BulletSpawner.cs` currently calls `Instantiate(bulletPrefab, ...)` to create bullets and `Destroy(bullet)` 2 seconds later. Replace this with a `UnityEngine.Pool.ObjectPool<Bullet>` configured in `Awake`. The spawner's `Fire()` method should call `pool.Get()` and pass a release callback to the bullet so it can `pool.Release(itself)` when it expires.
