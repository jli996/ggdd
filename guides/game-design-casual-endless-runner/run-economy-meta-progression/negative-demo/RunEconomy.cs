using UnityEngine;

// Anti-pattern: zero coins on failure, no unlockables system.
public class RunEconomy : MonoBehaviour
{
    public int coinsPerSecond = 2;
    public float failureCoinKeepPercent = 0f; // Player earns nothing on failure

    public float CoinsEarned(float runSeconds, bool succeeded)
    {
        if (!succeeded) return 0f; // Punitive — kills the "one more run" impulse
        return coinsPerSecond * runSeconds;
    }
}
