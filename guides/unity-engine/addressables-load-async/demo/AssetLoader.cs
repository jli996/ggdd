using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class AssetLoader : MonoBehaviour
{
    [SerializeField] private AssetReferenceGameObject enemyRef;
    private AsyncOperationHandle<GameObject> handle;

    async void Start()
    {
        handle = enemyRef.InstantiateAsync(transform.position, Quaternion.identity);
        await handle.Task;
    }

    void OnDestroy()
    {
        if (handle.IsValid()) Addressables.ReleaseInstance(handle);
    }
}
