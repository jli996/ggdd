---
id: cone-of-vision-falloff
category: game-design-ai-perception
title: AI cone of vision with distance and light falloff
description: AI visibility should fall off with distance, cone angle, and ambient light level. Moving targets are more visible. Flat linear visibility is unrealistic — combine distance falloff, angular falloff, and light threshold into a single CanSee check.
useCases:
  - "stealth game AI vision cone"
  - "guard detection range in stealth"
  - "AI line of sight with light level"
  - "motion visibility boost for AI"
  - "horror game AI perception design"
relatedGuides:
  - alert-state-machine-hysteresis
appliesTo:
  - "any stealth, horror, or AI-driven game where visibility to the player is a core mechanic"
tags: [ai-perception, state-machine, quality-of-life]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# AI cone of vision with distance and light falloff

A guard in a stealth game who "just knows" the player is there when they step into a circle feels cheap. Real-feeling AI perception combines:

1. **Distance**: visible at 3m; might not see you at 20m.
2. **Cone angle**: 90° forward cone; peripheral is ignored.
3. **Light level**: in shadow (lightLevel < 0.3), detection range halved.
4. **Motion**: moving targets are more visible than stationary ones (×1.5 effective brightness).

## Implementation

```csharp
using UnityEngine;

public class VisionCone : MonoBehaviour
{
    [SerializeField] private float visionRangeMeters = 20f;
    [SerializeField] private float coneAngleDegrees = 90f;
    [SerializeField] private float lightThreshold = 0.3f;
    [SerializeField] private float motionVisibilityBoost = 1.5f;

    /// <summary>
    /// Returns true if the AI can see the target given its position, ambient light, and movement speed.
    /// Does NOT include a line-of-sight raycast — add one externally if needed.
    /// </summary>
    public bool CanSee(Vector3 targetPos, float targetLightLevel, float targetSpeed)
    {
        float distance = Vector3.Distance(transform.position, targetPos);

        // Apply motion visibility boost to effective light level.
        float effectiveLightLevel = targetSpeed > 0.1f
            ? targetLightLevel * motionVisibilityBoost
            : targetLightLevel;

        // Darkness reduces effective detection range.
        float effectiveRange = effectiveLightLevel >= lightThreshold
            ? visionRangeMeters
            : visionRangeMeters * 0.5f;

        if (distance > effectiveRange) return false;

        // Cone angle check.
        Vector3 dirToTarget = (targetPos - transform.position).normalized;
        float angle = Vector3.Angle(transform.forward, dirToTarget);
        return angle <= coneAngleDegrees * 0.5f;
    }
}
```

## Avoid

- Flat circular detection radius with no cone — guards that see behind them feel unfair.
- Binary light threshold (fully visible or fully invisible) — gradual falloff is more natural.
- Ignoring target motion — stationary players should be harder to detect than sprinting ones.
- Checking CanSee every frame without throttling — raycast-heavy; throttle to 10-20Hz.

## Gotchas

- `CanSee` intentionally does not include a raycast — that's a separate concern (obstacle occlusion). Compose them: `CanSee(...) && !Physics.Linecast(...)`.
- `coneAngleDegrees` is the full cone angle; the angle comparison uses half of it.
- At range=0, the angle check is undefined (zero-length vector). Guard with `distance > 0.01f`.
