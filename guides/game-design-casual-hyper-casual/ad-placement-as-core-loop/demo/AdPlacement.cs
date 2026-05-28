using UnityEngine;

public class AdPlacement : MonoBehaviour
{
    [SerializeField] private int interstitialEveryNRuns = 3;
    [SerializeField] private float minSecondsBetweenInterstitials = 60f;
    [SerializeField] private bool offerRewardedDoubleCoins = true;
    [SerializeField] private bool offerRewardedContinue = true;

    public bool ShouldShowInterstitial(int runsSinceLast, float secondsSinceLast)
    {
        return runsSinceLast >= interstitialEveryNRuns
            && secondsSinceLast >= minSecondsBetweenInterstitials;
    }
}
