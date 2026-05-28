---
id: knockback-with-control-takeback
category: game-design-action
title: Knockback that returns control quickly
description: Apply impact-based knockback to the player but cap the lockout window (≤300ms). Long lockouts feel punishing; the player must regain agency before the next decision is needed.
useCases:
  - "implement player knockback in Unity"
  - "knockback feels too long or punishing"
  - "stun duration for player hits"
  - "give player control back after a hit"
  - "balance hit-stun in a brawler"
relatedGuides:
  - hit-stop-on-impact
appliesTo:
  - "any action game where the player gets hit and is briefly stunned"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Knockback that returns control quickly

When the player takes a hit, the world should react — knockback velocity, screen shake, hitsound. But the player must regain control within a tight window (typically 100–300ms). Long lockouts cascade: a 500ms stun followed by another hit means the player watches their character die without input.

The fix is to separate the **visual reaction** (which can persist as long as feels good) from the **input lockout** (which must be short).

## Implementation

```csharp
using UnityEngine;

public class Knockback : MonoBehaviour
{
    [SerializeField] private float lockoutDuration = 0.18f;
    [SerializeField] private Rigidbody2D rb;
    private float lockoutEndsAt = -1f;

    public bool IsLockedOut => Time.time < lockoutEndsAt;

    public void ApplyHit(Vector2 impulse)
    {
        rb.AddForce(impulse, ForceMode2D.Impulse);
        lockoutEndsAt = Time.time + lockoutDuration;
    }
}
```

Consumers (`PlayerController.Update`) check `IsLockedOut` and skip movement input during the window — but the knockback velocity continues to apply via the Rigidbody until friction/drag dissipates it.

## Avoid

- Lockouts >300ms. Players read this as "the game is taking turns away from me."
- Coupling lockout duration to knockback magnitude in a way that scales above the cap (e.g., heavy hit → 600ms lockout). Cap it.
- Disabling the rigidbody during lockout — the player should still drift with the impulse, just not steer.
- Forgetting to drop the lockout if the player dies mid-stun (loops cause input drops on the respawn frame).

## Gotchas

- Pair lockout with `hit-stop-on-impact` for the punchy first frames, then resume normal time with the knockback impulse still active.
- For platformers, allow horizontal input during lockout even if you lock attacks — directional steering during a stun feels good.
- If you have multiple lockout sources (knockback, parry, animation), unify into one `IsLockedOut` check rather than checking each.
