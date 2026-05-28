using UnityEngine;

public enum AlertLevel { Unaware, Suspicious, Alert, Searching, Patrol }

public class AlertState : MonoBehaviour
{
    [SerializeField] private float transitionCooldownSeconds = 0.5f;

    public AlertLevel currentLevel = AlertLevel.Unaware;
    private float lastTransitionAt = -999f;

    /// <summary>
    /// Attempts to transition to a new AlertLevel. Blocked by hysteresis cooldown.
    /// Returns true if the transition was applied.
    /// </summary>
    public bool TransitionTo(AlertLevel newLevel)
    {
        if (newLevel == currentLevel) return false;
        if (Time.time - lastTransitionAt < transitionCooldownSeconds) return false;

        currentLevel = newLevel;
        lastTransitionAt = Time.time;
        return true;
    }

    public bool IsAlert() => currentLevel == AlertLevel.Alert;
    public bool IsAware() => currentLevel != AlertLevel.Unaware;

    /// <summary>Returns true if the cooldown has expired and a transition is possible.</summary>
    public bool CanTransition() => Time.time - lastTransitionAt >= transitionCooldownSeconds;
}
