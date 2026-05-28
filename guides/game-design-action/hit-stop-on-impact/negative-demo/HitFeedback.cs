using UnityEngine;

public class HitFeedback : MonoBehaviour
{
    public void HitStop(float duration = -1f)
    {
        // Naive: assigns timeScale but never restores. Or uses WaitForSeconds (won't resume).
        Time.timeScale = 0f;
    }
}
