using UnityEngine;

public class LootDecay : MonoBehaviour
{
    // Indestructible gear, unlimited vault, no raid window.
    public bool CanAddToVault(int currentVaultCount) => true;
}
