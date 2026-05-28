# Task

Implement `Assets/Scripts/ResourceConverter.cs`. Provide:
- `Resource` enum with at least 3 values (Primary, Secondary, Meta).
- `[System.Serializable]` inner class `ConversionRecipe` with `costResource (Resource)`, `costAmount (int)`, `producesResource (Resource)`, `producesRatePerSecond (float)`.
- `[SerializeField] ConversionRecipe[] recipes` array.
- `CanAfford(Resource[] balances, int recipeIndex)` returning bool.
- `ApplyConversion(Resource[] balances, int recipeIndex)` deducting cost and returning updated balances.
</content>
