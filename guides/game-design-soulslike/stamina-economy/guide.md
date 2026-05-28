---
id: stamina-economy
category: game-design-soulslike
title: Stamina economy — the risk/reward meter of soulslike combat
description: Every action (attack, dodge, block, sprint) costs stamina. Running dry leaves the player exposed. Regen has a delay after use so spending carefully is meaningful. Tune maxStamina and regenPerSecond so mistakes are punishing but not crippling.
useCases:
  - "Dark Souls stamina bar design"
  - "soulslike stamina system tuning"
  - "action RPG stamina economy"
  - "stamina regen delay after combat action"
  - "dodge and attack stamina cost balancing"
relatedGuides:
  - readable-attack-telegraphs
appliesTo:
  - "any soulslike, action RPG, or melee-heavy game where resource management during combat matters"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Stamina economy

In Dark Souls, stamina is the central resource of combat. Every action costs some — attacks cost less than heavy attacks, rolls cost a fixed chunk, sprinting drains continuously. Running dry mid-combo leaves you unable to dodge. The risk: spending too liberally. The reward: aggressive play that stays within budget.

Three design knobs:
1. **Max stamina**: scales with endurance stat. Default ~100; early game ~60. Determines how many actions fit in a burst.
2. **Regen rate**: fills the bar over time. Higher = more forgiving. ~25-35/s is typical.
3. **Regen delay**: stamina does NOT regen while in combat action AND for a brief window after. Prevents instant-recovery combos.

## Implementation

```csharp
using UnityEngine;

public class StaminaSystem : MonoBehaviour
{
    [SerializeField] private float maxStamina = 100f;
    [SerializeField] private float regenPerSecond = 30f;
    [SerializeField] private float regenDelayAfterUseSeconds = 0.6f;

    private float currentStamina;
    private float lastStaminaUseAt = -999f;

    private void Awake()
    {
        currentStamina = maxStamina;
    }

    private void Update()
    {
        bool regenAllowed = Time.time - lastStaminaUseAt >= regenDelayAfterUseSeconds;
        if (regenAllowed && currentStamina < maxStamina)
        {
            currentStamina = Mathf.Min(maxStamina, currentStamina + regenPerSecond * Time.deltaTime);
        }
    }

    /// <summary>Tries to spend stamina. Returns false (and does NOT deduct) if insufficient.</summary>
    public bool TryConsume(float amount)
    {
        if (currentStamina < amount) return false;
        currentStamina -= amount;
        currentStamina = Mathf.Max(0f, currentStamina);
        lastStaminaUseAt = Time.time;
        return true;
    }

    public float CurrentStamina => currentStamina;
    public float MaxStamina => maxStamina;
    public float FractionRemaining => currentStamina / maxStamina;
}
```

## Avoid

- Zero regen delay — stamina becomes irrelevant if it recovers between every button press.
- Negative stamina — clamping at 0 ensures consistent "you're out" signalling.
- Regen delay > 2s — punishes the player beyond reasonable reaction time; combat becomes a waiting game.
- Same stamina cost for all actions — differentiation (light attack cheap, roll expensive) is where skill lives.

## Gotchas

- `TryConsume` should NOT deduct anything on failure — partial costs lead to confusing states where the player spent stamina but their action was cancelled.
- UI: show the regen delay visually (e.g. a briefly frozen bar) so the player learns the window.
- Stamina should remain visible even when full — players need to predict how many actions fit before committing to a combo.
