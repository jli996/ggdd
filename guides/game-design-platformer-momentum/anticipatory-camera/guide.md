---
id: anticipatory-camera
category: game-design-platformer-momentum
title: Anticipatory camera — frame ahead of fast-moving players
description: When a player moves fast, frame the camera ahead of them so they can see what's coming. A center-locked camera hides the terrain ahead and kills the momentum experience.
useCases:
  - "camera lead for momentum platformer"
  - "Sonic camera ahead of player"
  - "anticipatory camera offset"
  - "speed-proportional camera lead"
  - "fast platformer camera design"
relatedGuides:
  - momentum-preservation-transitions
  - level-as-race-track
appliesTo:
  - "any fast-moving platformer where speed exceeds what a centered camera can preview"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Anticipatory camera — frame ahead of fast-moving players

At low speeds, a player-centered camera works fine. At high speeds — Sonic at full sprint, Hollow Knight dashing — the camera must look ahead so the player can react to upcoming terrain.

The formula: compute a lead offset proportional to velocity, capped at a maximum look-ahead distance. The faster the player, the further ahead the camera looks. Below a threshold speed, the lead collapses to zero.

## Implementation

```csharp
using UnityEngine;

public class AnticipatoryCamera : MonoBehaviour
{
    [SerializeField] private float leadDistance = 3f;
    [SerializeField] private float maxLeadDistance = 6f;
    [SerializeField] private float leadAtSpeed = 8f;

    /// <summary>
    /// Returns a camera offset in the direction of player velocity,
    /// proportional to speed, capped at maxLeadDistance.
    /// </summary>
    public Vector2 ComputeOffset(Vector2 playerVelocity)
    {
        float speed = playerVelocity.magnitude;
        if (speed < 0.01f) return Vector2.zero;

        float leadScale = Mathf.Clamp(speed / leadAtSpeed, 0f, 1f);
        Vector2 direction = playerVelocity / speed;
        return direction * Mathf.Min(leadDistance * leadScale, maxLeadDistance);
    }
}
```

## Avoid

- A center-locked camera with no lead — player collides with off-screen obstacles before they can react.
- Lead offset that flips direction instantly on direction change — snapping leads to jarring camera motion. Lerp the offset over 3-5 frames.
- Max lead distance that shows too much terrain — spoils enemy placement or jump puzzles ahead.

## Gotchas

- `leadAtSpeed` is the speed at which the full `leadDistance` offset is applied. Below that, the offset scales linearly.
- `maxLeadDistance` acts as a hard clamp regardless of speed — important to prevent seeing out-of-view tiles at extreme velocities.
- In 3D collectathons (orthographic or behind-player cam), adapt this to a velocity-based Z offset rather than XY.
