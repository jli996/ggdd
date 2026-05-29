---
id: offline-progress-balancing
category: game-design-casual-clicker-idle
title: Offline progress balancing (30-50% rate, time cap)
description: Idle games generate currency while offline at a reduced rate (30-50% of online) to reward returning players without making offline strictly better than playing. A hard time cap (8-12 hours) prevents "just leave forever" strategies.
useCases:
  - "implement offline earnings in idle clicker game"
  - "calculate offline production with time cap in Unity"
  - "balance offline progress rate vs online rate in mobile idle game"
  - "design return-player reward in Cookie Clicker or AdVenture Capitalist style"
  - "cap offline hours so active play is still better than idle"
relatedGuides: []
appliesTo:
  - "idle and clicker games with persistent offline progression"
tags: [casual, clicker-idle, offline-progress, mobile-first, economy]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Offline progress balancing

AdVenture Capitalist and Cookie Clicker both generate resources while the app is closed. The design tension: generous enough to reward the player for returning, but never so generous that going offline is more efficient than actively playing. The industry standard is 30-50% of online rate with a hard cap of 8-12 hours, surfaced as a summary screen ("You earned X while away!") to make returning feel like an event.

## Implementation

```csharp
using UnityEngine;

public class OfflineProgress : MonoBehaviour
{
    /// Production fraction while offline; must be < 1 (offline < online).
    [SerializeField] private float offlineProductionMultiplier = 0.40f;
    /// Maximum hours of offline earnings; prevents "leave forever" strategies.
    [SerializeField] private float maxOfflineHours = 8f;
    /// Serialized so it persists across sessions (save with PlayerPrefs or cloud save).
    [SerializeField] private float lastOnlineTimestamp;

    /// Returns coins earned while the player was away.
    /// currentRate: online coins-per-second at the moment of calculation.
    /// now: current timestamp (e.g., Time.realtimeSinceStartup or a UTC epoch).
    public float OfflineEarnings(float currentRate, float now)
    {
        float elapsed        = now - lastOnlineTimestamp;
        float cappedSeconds  = Mathf.Min(elapsed, maxOfflineHours * 3600f);
        return currentRate * offlineProductionMultiplier * cappedSeconds;
    }

    private void OnApplicationPause(bool paused)
    {
        if (paused) lastOnlineTimestamp = Time.realtimeSinceStartup;
    }
}
```

## Avoid

- Offline rate equal to or greater than online rate — players will deliberately quit and reopen to farm; active play must always dominate.
- No time cap — without `maxOfflineHours`, a player gone for a week earns millions, trivialising all upgrade progression.
- Resetting `lastOnlineTimestamp` on every scene load rather than on `OnApplicationPause` — this breaks offline detection when the game navigates between scenes.

## Gotchas

- Use real-world timestamps (UTC epoch via `System.DateTime.UtcNow.Ticks`) instead of `Time.realtimeSinceStartup` in production; `realtimeSinceStartup` resets on each app launch.
- The "You earned X while away!" summary screen is an engagement hook — show it prominently on every cold launch when offline earnings > 0.
- Some titles double the cap but halve the rate for premium/VIP tiers; express this as a configurable multiplier pair rather than hardcoded constants.
- `offlineProductionMultiplier = 0.40f` means 40%; validate in the inspector that it stays in (0, 1) — a value ≥ 1 inverts the intended incentive.
</content>
