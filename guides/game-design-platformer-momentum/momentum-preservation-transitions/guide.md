---
id: momentum-preservation-transitions
category: game-design-platformer-momentum
title: Momentum preservation across movement state transitions
description: When a player transitions between movement states (ground→air, walljump→air, slope→jump, dash→ground), preserve their accumulated horizontal velocity. Punishing transitions kill flow.
useCases:
  - "preserve horizontal velocity on land"
  - "Sonic momentum-based platformer"
  - "wall jump horizontal retention"
  - "slope launch momentum boost"
  - "momentum platformer state transitions"
relatedGuides: []
appliesTo:
  - "any momentum-based platformer where speed is a core resource"
tags: [platformer, momentum-platformer, game-feel]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Momentum preservation across movement state transitions

In momentum-based platformers (Sonic, Hollow Knight, Celeste speed run), accumulated horizontal velocity is a resource. Every state transition — landing from a jump, jumping off a wall, launching off a slope — is an opportunity to either preserve or punish that resource.

Good momentum feel means transitions are **lossless by default** and the player feels the physics reward of their speed building.

Three transitions to handle:
1. **Ground→Air (jump)**: horizontal velocity carries forward without friction penalty.
2. **WallJump→Air**: retain a fraction of horizontal velocity from the pre-wall direction.
3. **Slope→Jump**: slopes act as ramps — a player running downhill builds speed; running uphill loses it proportionally.

## Implementation

```csharp
using UnityEngine;

public class MomentumTransitions : MonoBehaviour
{
    [SerializeField] private bool preserveHorizontalOnLand = true;
    [SerializeField] private float slopeMomentumGain = 1.2f;
    [SerializeField] private float wallJumpHorizontalRetention = 0.85f;

    /// <summary>
    /// When landing from air, preserve horizontal momentum.
    /// Returns the adjusted landing velocity.
    /// </summary>
    public Vector2 ProjectLandingVelocity(Vector2 airVelocity)
    {
        if (!preserveHorizontalOnLand)
            return new Vector2(0f, airVelocity.y);
        return new Vector2(airVelocity.x, airVelocity.y);
    }

    /// <summary>
    /// After a wall jump, blend the retained horizontal velocity with the new jump direction.
    /// </summary>
    public Vector2 WallJumpVelocity(Vector2 fromWall, Vector2 currentVel)
    {
        float retainedX = currentVel.x * wallJumpHorizontalRetention;
        return new Vector2(fromWall.x + retainedX, fromWall.y);
    }
}
```

## Avoid

- Zeroing horizontal velocity on every state transition — Sonic-style games feel like fighting the controls.
- Retaining 100% wall-jump horizontal momentum without any redirection — players slide along walls indefinitely.
- Slope momentum that ignores slope angle — flat and steep slopes should have different multipliers.

## Gotchas

- `wallJumpHorizontalRetention` in (0, 1] keeps the value physically meaningful. A value of 1.0 means no momentum loss; 0.85 is a common tuned value.
- `slopeMomentumGain` above 1.0 means the player gains speed going downhill. Values > 2.0 can cause runaway acceleration — clamp the resulting velocity.
- `preserveHorizontalOnLand` as a serialized bool makes it easy to A/B test with/without preservation in the editor.
