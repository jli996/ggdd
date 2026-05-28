# Expectations: object-pooling-basics

After applying this guide, the agent's `Assets/Scripts/BulletSpawner.cs` should:

1. Import `UnityEngine.Pool`.
2. Declare an `ObjectPool<Bullet>` field.
3. Initialize the pool in `Awake` (or `Start`) with at least `createFunc`, `actionOnGet`, `actionOnRelease`.
4. Call `pool.Get()` instead of `Instantiate(bulletPrefab)` in the spawn path.
5. Call `pool.Release(...)` somewhere (typically from the bullet's expiration callback).
6. Not call `Destroy(bullet)` in the spawn / despawn path (let the pool's `actionOnDestroy` handle terminal cleanup).
