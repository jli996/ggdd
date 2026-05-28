---
id: instant-restart-on-failure
category: game-design-casual-hyper-casual
title: Instant restart on failure (≤0.5s, one tap)
description: In hyper-casual games the restart is part of the gameplay loop. Death → one tap → playing again in under half a second. No loading screen, no menu, no confirmation dialog. The low retry friction is what makes "one more go" feel effortless.
useCases:
  - "implement instant restart in hyper-casual Unity game"
  - "design one-tap retry flow in Helix Jump or Stack style game"
  - "minimize death-to-restart transition time in casual mobile game"
  - "show retry button immediately on player death"
  - "validate restart speed is under 500ms for hyper-casual"
relatedGuides: []
appliesTo:
  - "hyper-casual games requiring frictionless retry on failure"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Instant restart on failure

Helix Jump restarts in under a second after death; there is no menu screen — the ball simply reappears at the top. Stack has a brief flash and the blocks reset. The pattern is universal in hyper-casual: the transition must be imperceptible, not dramatic. A loading screen or multi-step retry menu would shatter the "flow state" that keeps players in the loop.

## Implementation

```csharp
using UnityEngine;

public class InstantRestart : MonoBehaviour
{
    /// Must be ≤ 0.5 seconds for hyper-casual. Longer transitions belong in other genres.
    [SerializeField] private float restartTransitionSeconds = 0.3f;
    /// Show the retry button in the same frame as death — no delay.
    [SerializeField] private bool showRetryButtonImmediately = true;

    private bool isRestarting;

    public void OnPlayerDeath()
    {
        if (isRestarting) return;
        isRestarting = true;
        if (showRetryButtonImmediately) ShowRetryUI();
        Invoke(nameof(Restart), restartTransitionSeconds);
    }

    public void Restart()
    {
        isRestarting = false;
        HideRetryUI();
        ResetGameState();
    }

    /// Returns true only when both hyper-casual constraints are met.
    public bool IsInstantRestart()
    {
        return restartTransitionSeconds <= 0.5f && showRetryButtonImmediately;
    }

    private void ShowRetryUI()   { }
    private void HideRetryUI()   { }
    private void ResetGameState() { }
}
```

## Avoid

- `restartTransitionSeconds > 0.5f` — anything over half a second breaks the immediacy contract; players feel "stuck" in a failure state.
- Navigating to a main-menu scene on death — the scene load latency alone exceeds the hyper-casual restart budget.
- Showing an interstitial ad before the retry button — reserve ads for *after* the retry (triggered by `OnRunComplete`), not as a barrier to retrying.

## Gotchas

- `Invoke(nameof(Restart), 0f)` effectively defers one frame, which is enough for a flash effect without a noticeable delay — use 0.1–0.3 s for a brief scale-down animation.
- `isRestarting` guard prevents double-death if the player triggers multiple death conditions in the same frame (common in physics-heavy games).
- `showRetryButtonImmediately = true` means the UI appears on the same frame as death, before the brief transition completes — this is the correct UX: the player can tap instantly.
- Consider a `restartTransitionSeconds = 0f` path for rapid iteration during development; the guard `if (isRestarting)` still prevents re-entry.
</content>
