---
id: alert-state-machine-hysteresis
category: game-design-ai-perception
title: AI alert state machine with hysteresis — preventing state flickering
description: AI alert states (Unaware → Suspicious → Alert → Searching → Patrol) must not oscillate when stimulus hovers near thresholds. A transition cooldown (hysteresis) prevents rapid flickering between states, which looks broken and feels unfair.
useCases:
  - "stealth game AI alert state machine"
  - "guard detection states design"
  - "AI state hysteresis prevent flickering"
  - "suspicious to alert transition tuning"
  - "AI patrol and search state design"
relatedGuides:
  - cone-of-vision-falloff
  - sound-propagation-attenuated
appliesTo:
  - "any stealth, horror, or strategy game with multi-tier AI awareness states"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# AI alert state machine with hysteresis

A guard who oscillates between Unaware and Suspicious every 100ms is visually broken and tactically meaningless. Hysteresis ensures that once a transition happens, it cannot be reversed for a short window — forcing the AI to commit to a new state before re-evaluating.

Five alert levels:
1. **Unaware**: no stimuli. Routine patrol.
2. **Suspicious**: brief stimulus detected (sound, peripheral glimpse). Investigates.
3. **Alert**: confirmed contact. Full combat ready.
4. **Searching**: lost contact. Sweeps last known area.
5. **Patrol**: deliberate return-to-patrol after failing to find the player during Searching.

## Implementation

```csharp
using UnityEngine;

public enum AlertLevel { Unaware, Suspicious, Alert, Searching, Patrol }

public class AlertState : MonoBehaviour
{
    [SerializeField] private float transitionCooldownSeconds = 0.5f;

    public AlertLevel currentLevel = AlertLevel.Unaware;
    private float lastTransitionAt = -999f;

    /// <summary>
    /// Attempts to transition to a new AlertLevel. Blocked by hysteresis cooldown.
    /// Returns true if the transition was applied.
    /// </summary>
    public bool TransitionTo(AlertLevel newLevel)
    {
        if (newLevel == currentLevel) return false;
        if (Time.time - lastTransitionAt < transitionCooldownSeconds) return false;

        currentLevel = newLevel;
        lastTransitionAt = Time.time;
        return true;
    }

    public bool IsAlert() => currentLevel == AlertLevel.Alert;
    public bool IsAware() => currentLevel != AlertLevel.Unaware;

    /// <summary>Returns true if the cooldown has expired and a transition is possible.</summary>
    public bool CanTransition() => Time.time - lastTransitionAt >= transitionCooldownSeconds;
}
```

## Avoid

- No cooldown — states flicker whenever stimulus oscillates near threshold.
- Cooldown > 2s — AI feels sluggish; transitions should feel responsive even with hysteresis.
- Skipping states — going directly from Unaware to Alert without passing through Suspicious gives the player no warning they were seen.
- Making Patrol equivalent to Unaware — Patrol is a deliberate action ("I searched and found nothing"), not a reset.

## Gotchas

- `TransitionTo` returning false allows callers to know the transition was blocked — useful for debug logging.
- Escalation (Unaware → Alert) should bypass hysteresis if the stimulus is extreme (e.g. the player fires a gun directly at the guard). Implement this by calling `ForceTransition` that skips the cooldown.
- `lastTransitionAt = -999f` initialisation ensures the guard can transition immediately on first stimulus.
