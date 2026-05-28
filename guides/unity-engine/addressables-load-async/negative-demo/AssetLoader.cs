using UnityEngine;

public class AssetLoader : MonoBehaviour
{
    void Start()
    {
        var prefab = Resources.Load<GameObject>("Enemy");
        Instantiate(prefab, transform.position, Quaternion.identity);
    }
}
