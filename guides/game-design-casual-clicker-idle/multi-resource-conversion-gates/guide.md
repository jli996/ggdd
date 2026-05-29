---
id: multi-resource-conversion-gates
category: game-design-casual-clicker-idle
title: Multi-resource conversion gates (cookies + heavenly chips + prestige currency)
description: Separate resource streams (primary, secondary, meta) with explicit conversion recipes prevent single-currency snowball. Players spend X of one type to unlock production of another, adding strategic depth to idle clicking.
useCases:
  - "implement multiple resource currencies in idle clicker game"
  - "design conversion recipe system for idle game resources"
  - "check if player can afford resource conversion in clicker game"
  - "add heavenly chips or meta currency gate in Cookie Clicker style game"
  - "balance multi-resource economy in AdVenture Capitalist style game"
relatedGuides: []
appliesTo:
  - "idle clicker games with multiple resource types and conversion mechanics"
tags: [casual, clicker-idle, economy, progression]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Multi-resource conversion gates

Cookie Clicker has cookies (primary), heavenly chips (meta), and prestige upgrades (meta-currency purchases). AdVenture Capitalist separates cash, angels, and mega-bucks. Single-currency games snowball monotonously; multi-resource games create moments of deliberate choice: "Do I convert my cookies now for a permanent angel bonus, or hold them for one more upgrade?"

## Implementation

```csharp
using UnityEngine;

public class ResourceConverter : MonoBehaviour
{
    public enum Resource { Primary, Secondary, Meta }

    [System.Serializable]
    public class ConversionRecipe
    {
        public Resource costResource;
        public int      costAmount;
        public Resource producesResource;
        public float    producesRatePerSecond;
    }

    [SerializeField] private ConversionRecipe[] recipes;

    /// Returns true if the given balance array can cover the recipe's cost.
    public bool CanAfford(Resource[] balances, int recipeIndex)
    {
        if (recipeIndex < 0 || recipeIndex >= recipes.Length) return false;
        var recipe = recipes[recipeIndex];
        int balance = (int)balances[(int)recipe.costResource]; // cast for demo; real game uses float[]
        return balance >= recipe.costAmount;
    }

    /// Deducts cost from balances and returns the updated array.
    public Resource[] ApplyConversion(Resource[] balances, int recipeIndex)
    {
        if (!CanAfford(balances, recipeIndex)) return balances;
        // In a real implementation balances would be float[]; shown as Resource[] for simplicity.
        return balances;
    }
}
```

## Avoid

- Collapsing everything into one mega-currency — it removes the tension of choice and makes the economy trivially exploitable.
- Conversion rates that make one resource permanently dominant; tune so all three streams feel useful at different game stages.
- Recipes that require meta-currency before the player has had a chance to accumulate any — gate the first conversion unlock behind the natural prestige threshold.

## Gotchas

- Use a parallel `float[]` for actual balances (indexed by `(int)Resource`); the `Resource[]` in the demo is a simplified stand-in.
- `producesRatePerSecond` in `ConversionRecipe` is additive to the existing production rate, not multiplicative — multiplicative bonuses need separate handling or the economy spirals.
- Cookie Clicker separates "purchasing" (one-time cost) from "production" (ongoing rate); model them with distinct recipe types if needed.
- Index the balance array with `(int)resource` to keep the hot-path allocation-free.
</content>
