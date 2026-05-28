# Expectations: multi-resource-conversion-gates

After applying this guide, the agent's `Assets/Scripts/ResourceConverter.cs` should:

1. Define a `Resource` enum with at least 3 values (Primary, Secondary, Meta or equivalent).
2. Define a `[System.Serializable]` inner class `ConversionRecipe` with 4 fields: `costResource`, `costAmount`, `producesResource`, and `producesRatePerSecond`.
3. Declare a `recipes` array field of type `ConversionRecipe[]`.
4. Implement `CanAfford(Resource[], int)` returning a bool based on whether the player's balance covers the recipe cost.
5. Implement `ApplyConversion` method that uses or references the recipe index.
</content>
