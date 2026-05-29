---
id: forgiving-input-windows
category: game-design-platformer-precision
title: Forgiving input windows (coyote time, jump buffering, variable height)
description: Precision platformers feel fair when the game's input windows accommodate human reaction time variability. Coyote time, jump buffering, and variable jump height are the canonical trio.
useCases:
  - "coyote time for platformer jump"
  - "variable jump height tuning"
  - "platformer feels precise but forgiving"
  - "jump buffering window"
  - "Celeste-style jump feel"
relatedGuides:
  - tight-respawn-loop
appliesTo:
  - "any platformer where the player jumps with intent and timing"
tags: [platformer, precision-platformer, forgiving-input, game-feel, accessibility]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Forgiving input windows

A precision platformer that's actually precise — frame-perfect inputs, no tolerance — feels punishing, not skillful. Three forgiving windows fix this without sacrificing skill expression:

1. **Coyote time** (~100ms): jump button works for a brief window AFTER walking off a ledge. The player thinks "I jumped from the edge," the game treats it as a jump.
2. **Jump buffering** (~150ms): jump button press queues if pressed slightly before landing. Player thinks "I jumped on landing," game accepts the early press.
3. **Variable jump height**: holding jump = full height; tapping = short hop. Lets the player thread tight gaps without overshooting.

## Implementation

```csharp
using UnityEngine;

public class JumpTolerances : MonoBehaviour
{
    [SerializeField] private float coyoteTimeSeconds = 0.10f;
    [SerializeField] private float jumpBufferSeconds = 0.15f;
    [SerializeField] private float fullJumpVelocity = 12f;
    [SerializeField] private float shortHopMultiplier = 0.45f;

    private float lastGroundedAt = -1f;
    private float lastJumpPressedAt = -1f;

    public void OnGrounded() { lastGroundedAt = Time.time; }
    public void OnJumpPressed() { lastJumpPressedAt = Time.time; }

    public bool CanJump()
    {
        bool coyoteOk = Time.time - lastGroundedAt <= coyoteTimeSeconds;
        bool bufferedOk = Time.time - lastJumpPressedAt <= jumpBufferSeconds;
        return coyoteOk && bufferedOk;
    }

    public float ComputeJumpVelocity(bool held)
    {
        return held ? fullJumpVelocity : fullJumpVelocity * shortHopMultiplier;
    }
}
```

## Avoid

- Zero tolerance — frame-perfect inputs feel like a bug, not skill.
- Coyote time > 200ms — feels floaty, players "jump from the void."
- Buffer > 300ms — players' subsequent intentional jumps get auto-eaten by the buffer.
- Variable jump multiplier > 0.7 — short hop becomes pointless; tap and hold feel the same.

## Gotchas

- Coyote and buffer windows interact: a player may have both active simultaneously. Decide which takes precedence (usually buffer, since it represents intent).
- The "release jump = stop ascending" pattern should be implemented as a velocity cut (set vY to vY * shortHopMultiplier on release), not as physics tweaking.
- Frame timing matters: at 60fps, 100ms = 6 frames. At 30fps it's 3 frames. Tune by seconds, not frames.
