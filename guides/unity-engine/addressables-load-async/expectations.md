# Expectations: addressables-load-async

After applying this guide, the agent's modified `Assets/Scripts/AssetLoader.cs` should:

1. Import `UnityEngine.AddressableAssets`.
2. Use `AssetReference`, `AssetReferenceGameObject`, or `Addressables.LoadAssetAsync<T>` / `InstantiateAsync` for loading.
3. Either `await handle.Task` or subscribe to `handle.Completed`.
4. Not call `Resources.Load`, `Resources.LoadAsync`, or `AssetBundle.LoadFromFile/LoadAsset`.
5. Release the handle (`Addressables.Release` or `Addressables.ReleaseInstance`) when done with the instance.
