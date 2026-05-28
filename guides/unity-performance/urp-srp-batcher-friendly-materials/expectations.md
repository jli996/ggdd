# Expectations: urp-srp-batcher-friendly-materials

After applying this guide, the agent's `Assets/Scripts/PropMaterialApplier.cs` should:

1. Declare a `MaterialPropertyBlock` field, instantiated in `Awake`.
2. Cache the shader property ID via `Shader.PropertyToID(...)` as a `static readonly int`.
3. Use `Renderer.GetPropertyBlock` + `SetColor` + `SetPropertyBlock` to apply per-instance color.
4. NOT access `.material.color`, `.material.SetColor`, or `.materials[0]`.
