---
id: unit-counter-triangles
category: game-design-rts-classic
title: Unit counter triangles (rock-paper-scissors at army level)
description: RTS depth comes from army composition decisions. Each unit type has strong-against and weak-against relationships forming a counter triangle. Soft multipliers within tiers keep battles legible without being deterministic.
useCases:
  - "design unit counter system for rts"
  - "rock-paper-scissors unit triangle balance"
  - "cavalry vs spear vs archer counters"
  - "damage multiplier for unit matchups"
  - "army composition decision making"
relatedGuides: []
appliesTo:
  - "any real-time strategy game with unit type diversity"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Unit counter triangles

The core tension of an RTS army engagement is not raw stats — it is whether you brought the right composition. A counter triangle (e.g., Cavalry > Archer > Spear > Cavalry) forces players to react to scouting information rather than always producing the numerically strongest unit.

## Implementation

```csharp
using UnityEngine;

public enum UnitType { Infantry, Cavalry, Spear, Archer, Mage }

[CreateAssetMenu(menuName = "GGDD/UnitCounters")]
public class UnitCounters : ScriptableObject
{
    [System.Serializable]
    public class CounterRelation
    {
        public UnitType attacker;
        public UnitType victim;
        public float damageMultiplier;
    }

    [SerializeField] private CounterRelation[] relations = new CounterRelation[]
    {
        new CounterRelation { attacker = UnitType.Cavalry, victim = UnitType.Archer, damageMultiplier = 1.5f },
        new CounterRelation { attacker = UnitType.Spear,   victim = UnitType.Cavalry, damageMultiplier = 1.5f },
        new CounterRelation { attacker = UnitType.Archer,  victim = UnitType.Spear,  damageMultiplier = 1.35f },
        new CounterRelation { attacker = UnitType.Mage,    victim = UnitType.Infantry, damageMultiplier = 1.4f },
    };

    public float DamageMultiplier(UnitType atk, UnitType victim)
    {
        foreach (var r in relations)
        {
            if (r.attacker == atk && r.victim == victim)
                return r.damageMultiplier;
        }
        return 1.0f;
    }
}
```

## Avoid

- Flat 1.0 multiplier for all matchups — removes the counter mechanic entirely.
- Hard counters with ×3 multipliers — makes scouting too punishing; battles feel scripted.
- More than one level of counters per tier (A > B > C > D > A) — creates complexity without clarity.
- Ignoring soft counters within tiers (e.g., heavy vs. light infantry) — flattens strategic texture.

## Gotchas

- `DamageMultiplier` must return 1.0 as a default for unrelated matchups, or every encounter becomes unbalanced.
- `ScriptableObject` assets must be created via `[CreateAssetMenu]`; designers tune relationships in the Inspector without code changes.
- Counter multipliers around 1.25–1.5 provide meaningful but not decisive advantages — tune toward the lower end for casual audiences, higher for competitive.
- Mage / ranged counters often need separate "splash vs. melee" logic beyond simple lookup tables — keep the relation table as a first-pass approximation.
