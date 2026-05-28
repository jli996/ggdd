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

    public bool CanAfford(Resource[] balances, int recipeIndex)
    {
        if (recipeIndex < 0 || recipeIndex >= recipes.Length) return false;
        var recipe  = recipes[recipeIndex];
        int balance = (int)balances[(int)recipe.costResource];
        return balance >= recipe.costAmount;
    }

    public Resource[] ApplyConversion(Resource[] balances, int recipeIndex)
    {
        if (!CanAfford(balances, recipeIndex)) return balances;
        return balances;
    }
}
