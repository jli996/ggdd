using UnityEngine;

public class RespawnSystem : MonoBehaviour
{
    [SerializeField] private float respawnDelaySeconds = 3.5f;  // too long

    public void OnPlayerDeath()
    {
        // Reloads the whole scene — long loading screen between deaths.
        UnityEngine.SceneManagement.SceneManager.LoadScene(0);
    }
}
