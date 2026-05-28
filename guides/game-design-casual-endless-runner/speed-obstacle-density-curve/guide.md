---
id: speed-obstacle-density-curve
category: game-design-casual-endless-runner
title: Speed & obstacle density curve (RunnerDifficulty with AnimationCurve)
description: Runner speed ramps linearly over time up to a hard cap; obstacle density follows a separate AnimationCurve so designers can sculpt breathing room, tension peaks, and safe windows without touching code.
useCases:
  - "implement speed ramp over time in endless runner Unity game"
  - "use AnimationCurve for obstacle density in Temple Run or Subway Surfers"
  - "cap max speed in endless runner to prevent unfair difficulty"
  - "separate speed increase from obstacle density in runner difficulty"
  - "design difficulty curve for endless runner without code changes"
relatedGuides: []
appliesTo:
  - "endless runner games with time-based difficulty scaling"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Speed & obstacle density curve

Temple Run accelerates the player over the first 2-3 minutes, then plateaus near a maximum that is fast but theoretically survivable. Subway Surfers keeps speed more consistent but modulates obstacle density in waves. The key insight is that speed and density are *independent* knobs: raising both simultaneously creates impossible situations; separating them lets designers tune tension rhythmically.

## Implementation

```csharp
using UnityEngine;

public class RunnerDifficulty : MonoBehaviour
{
    [SerializeField] private float baseSpeed = 8f;
    [SerializeField] private float speedIncreasePerMinute = 1.5f;
    [SerializeField] private float maxSpeed = 25f;

    /// Designer-authored curve: X = elapsed seconds (0-300), Y = obstacle density (0-1).
    [SerializeField] private AnimationCurve obstacleDensityOverTime;

    /// Returns current forward speed, capped at maxSpeed.
    public float SpeedAt(float elapsedSeconds)
    {
        float rawSpeed = baseSpeed + (elapsedSeconds / 60f) * speedIncreasePerMinute;
        return Mathf.Min(rawSpeed, maxSpeed);
    }

    /// Evaluates the designer-authored density curve at the given elapsed time.
    public float ObstacleDensityAt(float elapsedSeconds)
    {
        return obstacleDensityOverTime.Evaluate(elapsedSeconds);
    }
}
```

## Avoid

- Constant speed with no ramp — players feel no progression and stop playing after a few minutes; the ramp is the difficulty arc.
- No `maxSpeed` cap — without it, speed eventually exceeds human reaction time and every run ends arbitrarily, not through skill failure.
- Hardcoding obstacle density — baking density as a linear `elapsedSeconds * k` expression removes the designer's ability to add breathing room or "wave" patterns.

## Gotchas

- `AnimationCurve` is serialised natively in Unity; just declare the field with `[SerializeField]` — no `new AnimationCurve()` needed in the inspector (Unity initialises it as a flat curve at 0).
- Evaluate the curve each frame and use its output to modulate spawn rates, not as an absolute count. For example: `spawnInterval = Mathf.Lerp(maxInterval, minInterval, density)`.
- Keep `maxSpeed > baseSpeed` or the cap is never meaningful — the grader explicitly checks this relationship.
- Speed at 5 minutes with the default `baseSpeed=8, speedIncreasePerMinute=1.5` would be `8 + 5×1.5 = 15.5`, well under `maxSpeed=25`. Tune these to control when the cap kicks in.
</content>
