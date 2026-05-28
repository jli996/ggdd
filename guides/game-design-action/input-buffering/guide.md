---
id: input-buffering
category: game-design-action
title: Input buffering for responsive action controls
description: Hold queued inputs for ~100–200ms so player presses during animation lockouts still register on the first frame the character becomes actionable.
useCases:
  - "make Unity action controls feel responsive"
  - "buffer jump input during animation"
  - "input feels late or dropped"
  - "queue attack inputs in a brawler"
  - "fixed input window after pressing button"
relatedGuides: []
appliesTo:
  - "any action / platformer / brawler with attack or movement animations that lock input"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Input buffering

In responsive action games, the player must be able to press an input *slightly before* the character can act on it and have the press still register. Without buffering, the input is dropped — the player perceives "controls feel late" or "the game ate my input."

A timer-based buffer is the standard fix: when the player presses the input, store the timestamp; when the character becomes actionable, consume any input whose timestamp is within the buffer window (commonly 100–200ms).

## Implementation

```csharp
using UnityEngine;

public class InputBuffer : MonoBehaviour
{
    [SerializeField] private float bufferWindow = 0.15f;
    private float bufferedAt = -1f;

    public void OnJumpPressed()
    {
        bufferedAt = Time.time;
    }

    public bool TryConsumeJump()
    {
        if (bufferedAt < 0f) return false;
        if (Time.time - bufferedAt > bufferWindow) return false;
        bufferedAt = -1f;
        return true;
    }
}
```

The character controller calls `TryConsumeJump()` on every frame it's actionable; if it returns true, it jumps.

## Avoid

- Reading `Input.GetButtonDown("Jump")` only inside `Update` while the character is locked — the down-press is consumed by the frame even though no action was taken.
- Buffer windows >300ms — feels like the game is choosing actions for the player.
- Buffer windows <50ms — defeats the purpose (single-frame humans can't reliably hit a 1-frame window at 60Hz).

## Gotchas

- Pair this with **coyote time** (the inverse: allow the input to fire shortly *after* the character leaves the actionable state, e.g., walking off a ledge). Buffering covers "early," coyote time covers "late."
- If multiple actions share a buffer (jump + attack), give each its own timestamp — they expire independently.
- For one-shot buffers, set the timestamp to a sentinel (`-1f` here) after consumption so a single press isn't consumed twice.
