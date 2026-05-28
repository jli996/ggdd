using UnityEngine;

public class RunnerDifficulty : MonoBehaviour
{
    [SerializeField] private float baseSpeed = 8f;
    [SerializeField] private float speedIncreasePerMinute = 1.5f;
    [SerializeField] private float maxSpeed = 25f;
    [SerializeField] private AnimationCurve obstacleDensityOverTime;

    public float SpeedAt(float elapsedSeconds)
    {
        float rawSpeed = baseSpeed + (elapsedSeconds / 60f) * speedIncreasePerMinute;
        return Mathf.Min(rawSpeed, maxSpeed);
    }

    public float ObstacleDensityAt(float elapsedSeconds)
    {
        return obstacleDensityOverTime.Evaluate(elapsedSeconds);
    }
}
