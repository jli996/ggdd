using UnityEngine;

// Anti-pattern: single resource, no conversion gates.
public class ResourceConverter : MonoBehaviour
{
    public float coins = 0f;
    public float coinsPerSecond = 1f;

    private void Update()
    {
        coins += coinsPerSecond * Time.deltaTime;
    }
}
