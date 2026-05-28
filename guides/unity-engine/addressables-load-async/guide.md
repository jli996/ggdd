---
id: addressables-load-async
category: unity-engine
title: Load assets asynchronously via Addressables (Unity 6)
description: Use the Addressables package's async APIs (LoadAssetAsync, InstantiateAsync) to load and instantiate prefabs and assets without blocking the main thread.
useCases:
  - "load a prefab at runtime in Unity"
  - "instantiate an asset asynchronously in Unity"
  - "replace Resources.Load with modern asset loading"
  - "stream assets without freezing the frame"
  - "manage asset memory with addressables"
relatedGuides: []
appliesTo:
  - "any script that loads prefabs, textures, or audio at runtime"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Load assets asynchronously via Addressables

Unity 6's recommended asset loading API is the [Addressables](https://docs.unity3d.com/Packages/com.unity.addressables@2.0/manual/index.html) package. It replaces `Resources.Load`, direct `AssetBundle` access, and synchronous instantiation patterns with async, reference-counted operations that stream data without blocking the main thread.

## Use Addressables async APIs

```csharp
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private AssetReferenceGameObject enemyRef;
    private AsyncOperationHandle<GameObject> handle;

    async void Start()
    {
        handle = enemyRef.InstantiateAsync(transform.position, Quaternion.identity);
        await handle.Task;
        var enemy = handle.Result;
        // configure spawned instance
    }

    void OnDestroy()
    {
        if (handle.IsValid()) Addressables.ReleaseInstance(handle);
    }
}
```

## Avoid

- `Resources.Load` / `Resources.LoadAsync` — the `Resources/` folder is loaded eagerly at build time, balloons memory, and isn't trimmed by build pipeline tree-shaking.
- Direct `AssetBundle` API — Addressables wraps bundles with reference counting and content catalogs.
- Synchronous `Instantiate(prefab)` on a fresh asset reference — that stalls the frame.

## Gotchas

- Always `Addressables.Release()` / `Addressables.ReleaseInstance()` what you instantiate. Leaks accumulate.
- `AssetReference` is checked at edit-time; `string` keys aren't — prefer typed references.
- Awaiting `handle.Task` is the modern pattern; `handle.Completed += ...` callbacks still work but are noisier.
