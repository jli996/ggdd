---
id: hit-stop-on-impact
category: game-design-action
title: Hit-stop on impact (action / brawler combat feel)
description: Briefly pause time on contact (50–100ms) to communicate weight and let the player register the hit. A core ingredient of crunchy action-game combat feel.
useCases:
  - "make hits feel weighty in a brawler"
  - "add hit-stop / hit-freeze on impact"
  - "implement screen pause when an attack connects"
  - "Unity Time.timeScale for combat impact"
  - "game feel polish for melee combat"
relatedGuides:
  - gc-free-update-loop
appliesTo:
  - "any action game with player-controlled melee/projectile combat"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Hit-stop on impact

Hit-stop (a.k.a. hit-freeze, hit-lag) is a brief pause of game time on the frame an attack lands. It's used universally in action-game combat — Smash Bros, Hollow Knight, brawlers — to:

1. Communicate weight: heavier hits = longer hit-stop.
2. Give the player a single frame to register the connection before the world resumes.
3. Mask animation transitions; the attacker is "stuck" on the impact frame for a few ms.

The mechanic is cheap: ~50–100ms `Time.timeScale = 0` (or scale-down) followed by a restore.

## Implementation

```csharp
using System.Collections;
using UnityEngine;

public class HitFeedback : MonoBehaviour
{
    [SerializeField] private float defaultDuration = 0.06f;
    private Coroutine running;

    public void HitStop(float duration = -1f)
    {
        if (duration < 0f) duration = defaultDuration;
        if (running != null) StopCoroutine(running);
        running = StartCoroutine(HitStopRoutine(duration));
    }

    private IEnumerator HitStopRoutine(float duration)
    {
        Time.timeScale = 0f;
        // WaitForSecondsRealtime ignores timeScale so we actually wait.
        yield return new WaitForSecondsRealtime(duration);
        Time.timeScale = 1f;
        running = null;
    }
}
```

Call `HitFeedback.HitStop(0.08f)` from the attacker's collision/hit confirmation. Scale duration with hit strength (light: 40ms, heavy: 120ms).

## Avoid

- Pausing with `Time.timeScale = 0` and then waiting with `yield return new WaitForSeconds(...)`. `WaitForSeconds` is governed by `timeScale`, so the coroutine never resumes.
- Forgetting to restore `Time.timeScale = 1`. A bug that pauses an attack mid-swing strands the game.
- Hit-stop longer than ~150ms — past that it feels broken, not weighty.

## Gotchas

- If you have a global pause system, hit-stop must respect it (don't restore time-scale to 1 if the player paused mid-stop).
- AudioSource pitch can also pause briefly for tactile feel — but only on impactful hits, not every attack.
- For non-time-based hit-stop (e.g., physics-driven combat), zero the attacker's `rigidbody.linearVelocity` for the same duration instead of `timeScale`.
