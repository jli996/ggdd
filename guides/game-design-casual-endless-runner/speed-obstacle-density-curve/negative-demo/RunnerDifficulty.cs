using UnityEngine;

// Anti-pattern: constant speed, constant density, no ramp, no cap, no AnimationCurve.
public class RunnerDifficulty : MonoBehaviour
{
    public float speed = 8f; // Never changes

    public float GetSpeed()
    {
        return speed; // Flat, no increase over time
    }

    public float GetObstacleDensity()
    {
        return 0.5f; // Hardcoded, no curve
    }
}
