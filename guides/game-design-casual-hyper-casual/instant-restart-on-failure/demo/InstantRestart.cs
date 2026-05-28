using UnityEngine;

public class InstantRestart : MonoBehaviour
{
    [SerializeField] private float restartTransitionSeconds = 0.3f;
    [SerializeField] private bool showRetryButtonImmediately = true;

    private bool isRestarting;

    public void OnPlayerDeath()
    {
        if (isRestarting) return;
        isRestarting = true;
        if (showRetryButtonImmediately) ShowRetryUI();
        Invoke(nameof(Restart), restartTransitionSeconds);
    }

    public void Restart()
    {
        isRestarting = false;
        HideRetryUI();
        ResetGameState();
    }

    public bool IsInstantRestart()
    {
        return restartTransitionSeconds <= 0.5f && showRetryButtonImmediately;
    }

    private void ShowRetryUI()    { }
    private void HideRetryUI()    { }
    private void ResetGameState() { }
}
