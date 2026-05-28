using UnityEngine;

// Anti-pattern: ad after every run, no rewarded ads, no minimum spacing.
public class AdPlacement : MonoBehaviour
{
    public bool ShouldShowInterstitial(int runsSinceLast, float secondsSinceLast)
    {
        return runsSinceLast >= 1; // Show after every single run — aggressive and spammy
    }
}
