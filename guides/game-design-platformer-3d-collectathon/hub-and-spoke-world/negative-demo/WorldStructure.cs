using UnityEngine;

// Anti-pattern: monolithic scene loader, no ability gating, no hub/spoke separation.
public class WorldStructure : MonoBehaviour
{
    public int totalWorlds = 5; // no sub-world data, no ability requirements

    public void LoadWorld(int index)
    {
        // All worlds always accessible — no gating, no backtracking incentive.
        UnityEngine.SceneManagement.SceneManager.LoadScene(index);
    }
}
