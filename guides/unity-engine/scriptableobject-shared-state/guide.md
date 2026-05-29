---
id: scriptableobject-shared-state
category: unity-engine
title: ScriptableObject as shared data container (Unity 6)
description: Hold project-wide configuration and shared runtime state in ScriptableObject assets instead of singleton MonoBehaviours or static fields.
useCases:
  - "share data between Unity scenes without singletons"
  - "store game settings as an asset"
  - "decouple systems via ScriptableObject events"
  - "replace static configuration class with ScriptableObject"
  - "avoid DontDestroyOnLoad singleton pattern"
relatedGuides: []
appliesTo:
  - "any class that holds project-wide configuration or shared state"
tags: [unity-engine, modern-api, quality-of-life]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# ScriptableObject as shared data container

`ScriptableObject` is Unity's serialized asset class for data that lives in the project (not in a scene). It's the modern alternative to:
- Singleton `MonoBehaviour` patterns with `DontDestroyOnLoad`
- Static configuration classes
- "GameManager" god-objects

Treating shared state as data assets makes it inspectable in the editor, version-controllable, and decoupled from scene lifetimes.

## Define a settings asset

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "GameSettings", menuName = "Game/Settings")]
public class GameSettings : ScriptableObject
{
    [Range(0f, 1f)] public float musicVolume = 0.7f;
    [Range(0f, 1f)] public float sfxVolume = 0.9f;
    public int targetFrameRate = 60;
}
```

Then consume by reference:

```csharp
using UnityEngine;

public class AudioController : MonoBehaviour
{
    [SerializeField] private GameSettings settings;

    void Start()
    {
        AudioListener.volume = settings.musicVolume;
        Application.targetFrameRate = settings.targetFrameRate;
    }
}
```

## Avoid

- `public static GameSettings Instance` singleton patterns. They tie lifetime to runtime, hide dependencies, and break domain reload.
- `DontDestroyOnLoad` GameObject carrying configuration — same issues.
- `static` mutable fields in `MonoBehaviour` subclasses — domain reload zeroes them between play sessions.

## Gotchas

- ScriptableObject mutations made at runtime persist to the asset in the Editor (but not in builds). Reset values in `OnEnable` if you need fresh state.
- A consumer must hold a `[SerializeField]` reference (or load via Addressables). ScriptableObjects can't be auto-discovered without `Resources` or asset databases.
