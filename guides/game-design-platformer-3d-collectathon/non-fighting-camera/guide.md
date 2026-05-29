---
id: non-fighting-camera
category: game-design-platformer-3d-collectathon
title: Non-fighting orbit camera with auto-reframe (Cinemachine 3)
description: A 3D collectathon camera should orbit the player, auto-reframe when the player stops moving, and yield control to the player immediately when they rotate. Never wrestle camera control from the player.
useCases:
  - "Mario 64 orbit camera design"
  - "Banjo-Kazooie camera feel"
  - "3D collectathon camera auto-reframe"
  - "orbit camera that yields to player input"
  - "Cinemachine 3 collectathon setup"
relatedGuides:
  - collectible-density-clumping
appliesTo:
  - "any 3D collectathon where the camera is behind the player and the world is explored by orbiting"
tags: [platformer, 3d-collectathon, game-feel, accessibility]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Non-fighting orbit camera with auto-reframe

Mario 64's camera was infamous — but the design intent was correct: an orbit camera that stays behind the player, auto-reframes after movement stops, and yields to manual control immediately. The execution was merely constrained by N64 hardware.

Modern implementation with Cinemachine 3: use a CinemachineCamera orbital target with auto-reframe enabled. When the player rotates the camera stick, switch to manual override priority and hold until a grace period after the player stops.

## Implementation

```csharp
using UnityEngine;

public class CollectathonCamera : MonoBehaviour
{
    [SerializeField] private float orbitDistance = 5f;
    [SerializeField] private bool autoFrameEnabled = true;
    [SerializeField] private float autoFrameDelay = 2f;     // seconds after player stops to auto-reframe
    [SerializeField] private int manualOverridePriority = 10; // Cinemachine priority when player is steering
    [SerializeField] private bool useCinemachine3 = true;   // toggle for Cinemachine 3 integration

    private float lastPlayerCameraInputAt = -1f;

    /// <summary>
    /// Returns true if the camera should yield control to the player's orbit input
    /// rather than auto-reframing.
    /// </summary>
    public bool ShouldYieldToPlayer(bool isPlayerInputtingCamera)
    {
        if (isPlayerInputtingCamera)
        {
            lastPlayerCameraInputAt = Time.time;
            return true;
        }
        // Keep yielding for grace period after player releases input.
        return Time.time - lastPlayerCameraInputAt < autoFrameDelay;
    }
}
```

## Avoid

- Auto-reframe that interrupts active player orbit — snaps the camera while the player is looking at something.
- Orbit distance that clips into geometry — add a physics collision pull-in rather than a fixed distance.
- Instantly centering the camera on movement — a short delay (1-2s) feels more natural and less jarring.

## Gotchas

- `autoFrameEnabled = false` should be a valid off switch for players who prefer full manual control (accessibility).
- `manualOverridePriority` works with Cinemachine's priority blending — when the manual override camera has higher priority, it takes control without a hard cut.
- `useCinemachine3 = true` as a serialized field makes the integration point visible to designers without requiring full Cinemachine API knowledge in this class.
