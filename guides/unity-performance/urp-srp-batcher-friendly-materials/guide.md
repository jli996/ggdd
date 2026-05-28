---
id: urp-srp-batcher-friendly-materials
category: unity-performance
title: SRP Batcher-friendly material usage (URP, Unity 6)
description: Use MaterialPropertyBlock for per-instance variation instead of cloning materials, so URP's SRP Batcher can keep batching draw calls.
useCases:
  - "fix SRP Batcher breaking in URP"
  - "per-renderer color without instancing"
  - "reduce draw calls in URP"
  - "MaterialPropertyBlock vs material.color"
  - "avoid material cloning at runtime"
relatedGuides: []
appliesTo:
  - "any script that tints or modifies a per-instance material property at runtime"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# SRP Batcher-friendly material usage

URP's [SRP Batcher](https://docs.unity3d.com/Manual/SRPBatcher.html) reduces CPU overhead by batching draw calls that share a shader (not necessarily a material). The moment you touch `renderer.material.color`, Unity *clones* the material into a unique instance — and that instance loses SRP Batcher compatibility for that renderer.

Use `MaterialPropertyBlock` instead. It overrides shader properties per-renderer without cloning the material.

## Per-renderer tint without cloning

```csharp
using UnityEngine;

public class PropMaterialApplier : MonoBehaviour
{
    private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
    private Renderer rend;
    private MaterialPropertyBlock mpb;

    void Awake()
    {
        rend = GetComponent<Renderer>();
        mpb = new MaterialPropertyBlock();
    }

    public void SetColor(Color c)
    {
        rend.GetPropertyBlock(mpb);
        mpb.SetColor(BaseColorId, c);
        rend.SetPropertyBlock(mpb);
    }
}
```

## Avoid

- `renderer.material.color = ...` — clones the material per instance.
- `renderer.materials[0] = ...` (assigning a new material array) — also clones.
- Per-renderer shader keyword toggling without `MaterialPropertyBlock` integration — same cost.

## Gotchas

- Use `Shader.PropertyToID(...)` once (static readonly), not the string overload every call — string lookups are expensive.
- `_BaseColor` is URP's color property name; built-in RP uses `_Color`. Don't mix.
- `MaterialPropertyBlock` overrides survive scene saves only if applied in edit mode via `[ExecuteAlways]`. For runtime-only tints this doesn't matter.
