---
id: one-tap-control-schemes
category: game-design-casual-hyper-casual
title: One-tap control schemes (Crossy Road, Helix Jump, Stack)
description: Hyper-casual games are playable with a single finger. Tap, tap-and-hold, or single swipe are the only valid input modes. Complexity lives in level design, not input. Any multi-touch requirement is a design failure for this genre.
useCases:
  - "implement one-tap controls in hyper-casual Unity game"
  - "design single-finger input for Crossy Road or Helix Jump style game"
  - "validate hyper-casual input mode is single-finger only"
  - "choose between tap-and-hold vs single-tap control scheme"
  - "enforce no-two-finger requirement in hyper-casual game"
relatedGuides: []
appliesTo:
  - "hyper-casual mobile games targeting one-finger interaction"
tags: [casual, hyper-casual, one-tap, accessibility, mobile-first]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# One-tap control schemes

Crossy Road: tap to hop forward. Helix Jump: swipe to rotate. Stack: tap to drop. The genre's defining constraint is that a new player picks up the game immediately — no tutorial needed — because the input model is trivially obvious. Two-finger gestures, virtual joysticks, or UI buttons violate this contract.

## Implementation

```csharp
using UnityEngine;

public class OneInputControl : MonoBehaviour
{
    public enum InputMode { SingleTap, TapAndHold, SingleSwipe }

    [SerializeField] private InputMode mode = InputMode.SingleTap;
    /// MUST be false. Any two-finger requirement breaks hyper-casual accessibility.
    [SerializeField] private bool requiresTwoFingers = false;

    public void OnTap()
    {
        if (mode == InputMode.SingleTap) HandleTap();
    }

    public void OnHoldStart()
    {
        if (mode == InputMode.TapAndHold) HandleHoldStart();
    }

    public void OnHoldEnd()
    {
        if (mode == InputMode.TapAndHold) HandleHoldEnd();
    }

    public void OnSwipe(Vector2 delta)
    {
        if (mode == InputMode.SingleSwipe) HandleSwipe(delta);
    }

    /// Returns true only if the control scheme is genuinely hyper-casual.
    public bool IsHyperCasualValid()
    {
        return requiresTwoFingers == false;
    }

    private void HandleTap()       { /* jump, select, drop */ }
    private void HandleHoldStart() { /* charge, hold-to-aim */ }
    private void HandleHoldEnd()   { /* release, fire */ }
    private void HandleSwipe(Vector2 delta) { /* rotate, swipe-to-move */ }
}
```

## Avoid

- Virtual joysticks — they require thumb-eye coordination that breaks the "playable without looking" hyper-casual promise.
- Multi-touch (pinch, two-finger rotate) — `requiresTwoFingers = true` is a disqualifying anti-pattern; `IsHyperCasualValid()` explicitly guards against this.
- More than one `InputMode` active simultaneously — pick one per game; hybrid schemes (tap + swipe) feel unpredictable.

## Gotchas

- Helix Jump uses continuous drag, not a "swipe" event — model that as `TapAndHold` with delta tracking, not as a separate mode.
- Stack uses tap only; holding adds no behaviour — keep `OnHoldStart`/`OnHoldEnd` as no-ops in that mode to avoid accidental hold detection.
- On mobile, `Input.GetMouseButtonDown(0)` detects the first touch; `Input.touchCount > 1` can be used to gate multi-touch if a device fires spurious second touches.
- Always test with the Unity Input System's "Simulate Touch Input" option so desktop playtesting doesn't hide touch-specific bugs.
</content>
