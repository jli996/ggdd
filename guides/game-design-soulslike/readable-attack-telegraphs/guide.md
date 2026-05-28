---
id: readable-attack-telegraphs
category: game-design-soulslike
title: Readable attack telegraphs — windup, attack, recovery
description: Every enemy attack in a soulslike should be readable in 0.5–1.2 seconds. The player is punished for missing the read, not for the read taking too long. A windup phase telegraphs intent; a recovery phase creates counter-attack opportunity.
useCases:
  - "Dark Souls enemy attack design"
  - "soulslike enemy telegraph timing"
  - "boss attack readable windup phase"
  - "stagger window for counter-attack"
  - "enemy recovery window soulslike"
relatedGuides:
  - stamina-economy
appliesTo:
  - "any soulslike, character action game, or melee-focused game with deliberate enemy attack patterns"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Readable attack telegraphs

A Dark Souls boss that kills you before you understand the attack has failed its design. The player must see the attack coming, decide to dodge/block/parry, execute — all within the windup window. The windup should be generous enough that a skilled player can always react, but not so generous that it becomes trivial.

Three phases:
1. **Windup** (0.5–1.2s): enemy winds up, animation telegraphs attack type (overhead, sweep, thrust). Player must read and commit to a response.
2. **Attack** (varies by attack type): the actual hitbox-active frame(s). Short for quick attacks, sustained for slow sweeps.
3. **Recovery** (>0s): enemy is locked into recovery, cannot follow up. This is the stagger window — the player's window to counter-attack.

## Implementation

```csharp
using UnityEngine;

public class EnemyAttackTelegraph : MonoBehaviour
{
    [SerializeField] private float windupSeconds = 0.7f;
    [SerializeField] private float recoverySeconds = 0.4f;
    [SerializeField] private float staggerWindowSeconds = 0.3f;

    private float attackStartedAt = -999f;
    private bool attacking = false;

    public void StartTelegraph()
    {
        attackStartedAt = Time.time;
        attacking = true;
    }

    public bool IsAttacking()
    {
        if (!attacking) return false;
        float elapsed = Time.time - attackStartedAt;
        // Active attack phase begins after windup; ends after windup + recovery.
        return elapsed >= windupSeconds && elapsed < windupSeconds + recoverySeconds;
    }

    public bool IsInStaggerWindow()
    {
        if (!attacking) return false;
        float elapsed = Time.time - attackStartedAt;
        float staggerStart = windupSeconds + recoverySeconds;
        return elapsed >= staggerStart && elapsed < staggerStart + staggerWindowSeconds;
    }

    public void OnAttackComplete()
    {
        attacking = false;
    }
}
```

## Avoid

- Windup < 0.5s — most players cannot physically react faster than ~200ms; windup this short is a gotcha, not skill.
- Windup > 1.2s — attacks become trivially readable; removes tension and turns combat into a slow dance.
- Zero recovery — removing the counter-attack window punishes the player for succeeding at the read.
- All attacks having identical windup — players can pattern-match and stop reading, reducing engagement.

## Gotchas

- Windup animation and windup timer must be in sync. If the animation cuts short but the hitbox stays active, players feel cheated.
- `staggerWindowSeconds` is the "success reward" — it should be generous enough (~0.3s) that a skilled player reliably lands a counter.
- Tracking `attackStartedAt` allows external systems (e.g. parry) to query the exact phase without polling state machines.
