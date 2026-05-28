using System.Collections;
using UnityEngine;

public class HitFeedback : MonoBehaviour
{
    [SerializeField] private float defaultDuration = 0.06f;
    private Coroutine running;

    public void HitStop(float duration = -1f)
    {
        if (duration < 0f) duration = defaultDuration;
        if (running != null) StopCoroutine(running);
        running = StartCoroutine(HitStopRoutine(duration));
    }

    private IEnumerator HitStopRoutine(float duration)
    {
        Time.timeScale = 0f;
        yield return new WaitForSecondsRealtime(duration);
        Time.timeScale = 1f;
        running = null;
    }
}
