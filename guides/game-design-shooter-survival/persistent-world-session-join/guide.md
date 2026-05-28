---
id: persistent-world-session-join
category: game-design-shooter-survival
title: Persistent-world session join (log-off timer + relog cooldown)
description: Handle player logout/login in a continuously-running survival shooter world without enabling combat-logging exploits or punishing legitimate disconnects.
useCases:
  - "prevent combat logging in survival shooter"
  - "design relog cooldown in MMO survival"
  - "log-off timer for persistent world"
  - "handle player disconnect during PvP"
  - "DayZ-style session join"
relatedGuides: []
appliesTo:
  - "any survival shooter with a persistent server and player-vs-player risk"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Persistent-world session join

In a persistent-world survival shooter (DayZ, Rust, ARK), players can connect and disconnect mid-encounter. Without design intervention, this enables **combat logging**: a player about to die quits the game, their character vanishes, no death, no loot dropped.

The standard fix is a two-part timer:
1. **Log-off timer**: when the player initiates logout, their character stays in-world (visible, killable) for N seconds before despawning.
2. **Relog cooldown**: a player who disconnected in a hot zone can't immediately rejoin from a safe location.

## Implementation

```csharp
using UnityEngine;

public class SessionGuard : MonoBehaviour
{
    [SerializeField] private float logOffSeconds = 30f;
    [SerializeField] private float relogCooldownSeconds = 60f;
    private float logOffStartedAt = -1f;
    private float lastDisconnectAt = -1f;

    public bool IsLoggingOff => logOffStartedAt >= 0f;

    public void RequestLogOff()
    {
        // Character remains in-world for `logOffSeconds`.
        logOffStartedAt = Time.time;
    }

    public bool CanCompleteLogOff()
    {
        return IsLoggingOff && Time.time - logOffStartedAt >= logOffSeconds;
    }

    public void OnDisconnect()
    {
        lastDisconnectAt = Time.time;
    }

    public bool CanRejoin()
    {
        if (lastDisconnectAt < 0f) return true;
        return Time.time - lastDisconnectAt >= relogCooldownSeconds;
    }
}
```

## Avoid

- Instantly despawning a character on logout/disconnect — that's the combat-logging exploit.
- Zero relog cooldown — lets a dying player reconnect repeatedly from a safe spawn.
- Coupling logout flow to network state only — a player who pulls their network cable is the same threat as one who clicks "Quit."

## Gotchas

- The log-off window should be visible to nearby players ("Logging out in 30s…") so they have agency over whether to engage.
- Internet drops != combat-log intent — but the system can't tell the difference, so treat both the same and tune the cooldown to be friction, not punishment.
- Servers should persist `lastDisconnectAt` across restarts; otherwise a server crash resets every player's cooldown.
