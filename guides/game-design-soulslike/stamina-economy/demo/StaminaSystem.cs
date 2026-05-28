using UnityEngine;

public class StaminaSystem : MonoBehaviour
{
    [SerializeField] private float maxStamina = 100f;
    [SerializeField] private float regenPerSecond = 30f;
    [SerializeField] private float regenDelayAfterUseSeconds = 0.6f;

    private float currentStamina;
    private float lastStaminaUseAt = -999f;

    private void Awake()
    {
        currentStamina = maxStamina;
    }

    private void Update()
    {
        bool regenAllowed = Time.time - lastStaminaUseAt >= regenDelayAfterUseSeconds;
        if (regenAllowed && currentStamina < maxStamina)
        {
            currentStamina = Mathf.Min(maxStamina, currentStamina + regenPerSecond * Time.deltaTime);
        }
    }

    /// <summary>Tries to spend stamina. Returns false (and does NOT deduct) if insufficient.</summary>
    public bool TryConsume(float amount)
    {
        if (currentStamina < amount) return false;
        currentStamina -= amount;
        currentStamina = Mathf.Max(0f, currentStamina);
        lastStaminaUseAt = Time.time;
        return true;
    }

    public float CurrentStamina => currentStamina;
    public float MaxStamina => maxStamina;
    public float FractionRemaining => currentStamina / maxStamina;
}
