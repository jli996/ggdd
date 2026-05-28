# Task

`Assets/Scripts/PropMaterialApplier.cs` currently tints its renderer by setting `GetComponent<Renderer>().material.color = c`. This breaks URP's SRP Batcher. Refactor it to use a `MaterialPropertyBlock` cached in `Awake` and a `Shader.PropertyToID("_BaseColor")` static readonly id.
