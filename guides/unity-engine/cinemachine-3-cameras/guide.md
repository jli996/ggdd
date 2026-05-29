---
id: cinemachine-3-cameras
category: unity-engine
title: Cinemachine 3 cameras (Unity 6 default)
description: Use Cinemachine 3's `CinemachineCamera` (Unity.Cinemachine namespace) for virtual cameras. Cinemachine 2's `CinemachineVirtualCamera` is legacy in Unity 6 — migrate if your project still uses it.
useCases:
  - "set up camera with Cinemachine 3 in Unity 6"
  - "CinemachineCamera vs CinemachineVirtualCamera"
  - "Unity.Cinemachine namespace"
  - "camera blending with Cinemachine"
  - "migrate from Cinemachine 2 to 3"
relatedGuides: []
appliesTo:
  - "any Unity 6 project using virtual cameras or camera blending"
tags: [unity-engine, modern-api, game-feel]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Cinemachine 3 cameras (Unity 6 default)

Cinemachine 3 is a major API rewrite from CM2, and is the Unity 6 default. The two versions are NOT interoperable:

| Concern | CM2 (legacy) | CM3 (modern, Unity 6 default) |
|---|---|---|
| Namespace | `Cinemachine` | `Unity.Cinemachine` |
| Virtual camera | `CinemachineVirtualCamera` | `CinemachineCamera` |
| Pipeline | pipeline stages (Body/Aim/Noise/Finalize) | individual components attached to the GameObject |
| Brain | `CinemachineBrain` (same name, evolved) | `CinemachineBrain` |

A Unity 6 project starting fresh should use CM3. A project on CM2 should migrate via the Unity Cinemachine Upgrader window.

## Use CinemachineCamera (CM3)

```csharp
using UnityEngine;
using Unity.Cinemachine;

public class PlayerCamera : MonoBehaviour
{
    [SerializeField] private CinemachineCamera followCam;
    [SerializeField] private CinemachineCamera aimCam;
    [SerializeField] private Transform target;

    void Start()
    {
        followCam.Target.TrackingTarget = target;
        followCam.Priority = 10;
        aimCam.Priority = 5;
    }

    public void EnterAimMode()
    {
        // Higher priority wins.
        followCam.Priority = 5;
        aimCam.Priority = 15;
    }
}
```

## Avoid

- `using Cinemachine;` (CM2 namespace) — replace with `using Unity.Cinemachine;`.
- `CinemachineVirtualCamera` (CM2 type) — replace with `CinemachineCamera`.
- Hand-coding `Camera.transform = ...` to switch viewpoints — that bypasses CM3's blending and breaks camera-aware features.
- Mixing CM2 and CM3 in the same project — they don't coexist cleanly; upgrade the whole project.

## Gotchas

- Migration: Window → Cinemachine → Upgrader. It auto-converts most assets but check serialized references.
- `CinemachineCamera.Priority` is an int; higher wins. Set priorities explicitly rather than relying on Unity component order.
- `CinemachineBrain` lives on the `Camera`, not on the virtual cameras. Don't add multiple Brains.
