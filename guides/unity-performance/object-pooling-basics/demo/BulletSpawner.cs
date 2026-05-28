using UnityEngine;
using UnityEngine.Pool;

public class Bullet : MonoBehaviour
{
    public void Launch(Vector3 from, Vector3 dir, System.Action onExpire) {}
}

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
