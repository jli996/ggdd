---
id: role-utility-orthogonality
category: game-design-shooter-competitive
title: Role / utility orthogonality (each class brings distinct utility)
description: In a team-based competitive shooter, each class/agent should bring orthogonal utility (smokes / flashes / intel / heal) so team composition matters. Avoid the "best pick" problem where one class dominates regardless of comp.
useCases:
  - "design class roles in team shooter"
  - "avoid hero shooter best pick problem"
  - "utility orthogonality in Valorant"
  - "ability variety per agent class"
  - "balance team comp variety"
relatedGuides:
  - round-based-economy-reset
appliesTo:
  - "any team-based competitive shooter with class/agent selection"
tags: [shooter, competitive-shooter, class-design, pvp]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Role / utility orthogonality

In a team-based competitive shooter, the strategic depth comes from team composition. For comp to matter, each class must bring tools the OTHERS DON'T HAVE. If every class has a smoke + a flash + a heal, then the only differentiator is raw weapon stats — comp collapses to "pick the best DPS."

Design principle: each class's utility set should be **orthogonal** to others — different tool categories, not different flavors of the same tool.

## Implementation

```csharp
using UnityEngine;

public enum UtilityCategory { Smoke, Flash, Intel, Heal, Mobility, Trap, Wall }

[CreateAssetMenu(fileName = "AgentClass", menuName = "Game/Agent Class")]
public class AgentClass : ScriptableObject
{
    public string className;
    public UtilityCategory[] utilityCategories;  // typically 2-3 per class
    public int weaponDamage = 30;  // intentionally close to other classes
    public float moveSpeed = 5f;
}
```

For example, valid orthogonal comps:
- Smoker (Smoke + Flash) + Intel (Intel + Trap) + Medic (Heal + Mobility)
- Each fills a niche the others can't.

Compare to a NON-orthogonal design:
- Class A: smoke + flash + heal
- Class B: smoke + flash + heal
- Class C: smoke + flash + heal
- → only "best DPS" matters.

## Avoid

- Every class with the same utility categories — degenerates to flat DPS competition.
- One class with all the utility (4+ categories) — "best pick" no matter what comp.
- Universal heal that every class can self-cast — removes the support role's reason to exist.

## Gotchas

- Weapon damage should NOT vary widely across classes — gunplay should feel similar. Differentiation lives in utility, not in primary fire.
- Move speed differences should be ≤20% — large speed gaps make slow classes feel oppressive to play.
- Cap a single class at 3 utility categories. More than that and the class is "best pick."
