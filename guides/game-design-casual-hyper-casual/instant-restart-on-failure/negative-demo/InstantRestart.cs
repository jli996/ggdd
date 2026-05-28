using UnityEngine;
using UnityEngine.SceneManagement;

// Anti-pattern: death triggers menu screen, multi-step restart flow.
public class InstantRestart : MonoBehaviour
{
    public float restartTransitionSeconds = 3.0f; // Way too long
    public bool showRetryButtonImmediately = false; // Shown only after a delay

    public void OnPlayerDeath()
    {
        // Navigate to main menu — adds full scene-load latency
        SceneManager.LoadScene("MainMenu");
    }
}
