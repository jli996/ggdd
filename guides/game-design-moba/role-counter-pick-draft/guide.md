---
id: role-counter-pick-draft
category: game-design-moba
title: Role counter-pick draft (ban/pick phases and comp variety)
description: MOBA draft phases let teams ban threats and pick counter-picks. Distinct roles (Tank/Assassin/Support/Marksman/Mage) create compositional variety. Requiring 3+ distinct roles in a valid draft discourages mono-strategy.
useCases:
  - "design moba draft and ban system"
  - "champion role counter-pick design"
  - "moba draft phase ban pick order"
  - "team composition variety enforcement"
  - "role diversity in moba drafting"
relatedGuides: []
appliesTo:
  - "any MOBA with champion selection and team composition mechanics"
tags: [strategy, moba, class-design, pvp]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Role counter-pick draft

The draft phase is the strategic layer before a MOBA match begins. Banning removes strong threats; picking in alternating order forces teams to adapt. Requiring compositional diversity (≥3 distinct roles) prevents degenerate full-assassin or full-tank drafts.

## Implementation

```csharp
using UnityEngine;
using System.Linq;

public enum Role { Tank, Assassin, Support, Marksman, Mage }

public class DraftSystem : MonoBehaviour
{
    [SerializeField] private int banCount = 5;
    [SerializeField] private int pickCount = 5;
    [SerializeField] private bool pickAfterBan = true;

    /// Returns true if the draft has at least 3 distinct roles represented.
    public bool IsValidDraft(Role[] picks)
    {
        if (picks == null || picks.Length == 0) return false;
        int distinctRoles = picks.Distinct().Count();
        return distinctRoles >= 3;
    }
}
```

## Avoid

- No ban phase — allows one team to always pick the strongest champion regardless of matchup.
- Simultaneous picks instead of alternating — removes counter-pick tension entirely.
- No role diversity requirement — full Tank or full Assassin comps become dominant.
- Fewer than 5 roles — limits compositional variety to a handful of archetypes.

## Gotchas

- `banCount` and `pickCount` should match (typically 5 each for a 5v5 game) — but are configurable for different game modes.
- `pickAfterBan = true` enforces the standard ban-first-then-pick flow; disabling it allows simultaneous ban/pick for faster-paced modes.
- `IsValidDraft` using `Distinct().Count() >= 3` is a minimum bar — competitive modes may enforce role slots (one Support required, etc.).
- The `Role` enum should map cleanly to champion archetypes in your roster; adding "Jungler" as a 6th role is common in deeper MOBAs.
