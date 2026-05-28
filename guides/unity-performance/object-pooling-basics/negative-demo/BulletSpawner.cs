using UnityEngine;

public class Bullet : MonoBehaviour
{
    public void Launch(Vector3 from, Vector3 dir) {}
}

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet bulletPrefab;

    public void Fire(Vector3 from, Vector3 dir)
    {
        var b = Instantiate(bulletPrefab);
        b.Launch(from, dir);
        Destroy(b.gameObject, 2f);
    }
}
