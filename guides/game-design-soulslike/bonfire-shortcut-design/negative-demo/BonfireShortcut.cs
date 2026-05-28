using UnityEngine;

// Anti-pattern: no shortcut data structure, no bonfire linkage, just a scene loader.
public class BonfireShortcut : MonoBehaviour
{
    public int bonfireCount = 3; // no bonfire data, no shortcut lookup

    public void TeleportToBonfire(int index)
    {
        // No shortcut system, just direct teleport — no exploration reward.
        UnityEngine.SceneManagement.SceneManager.LoadScene(index);
    }
}
