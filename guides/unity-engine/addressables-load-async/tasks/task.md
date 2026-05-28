# Task

`Assets/Scripts/AssetLoader.cs` currently loads an enemy prefab synchronously via `Resources.Load<GameObject>("Enemy")` and `Instantiate`. Refactor it to load via the Addressables package using `AssetReferenceGameObject` (serialized field named `enemyRef`) and `InstantiateAsync` awaited in `Start`. Release the handle in `OnDestroy`.
