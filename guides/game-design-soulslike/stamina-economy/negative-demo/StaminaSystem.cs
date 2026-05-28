using UnityEngine;

// Anti-pattern: no regen delay, no bool return, allows negative stamina.
public class StaminaSystem : MonoBehaviour
{
    public float stamina = 100f;

    private void Update()
    {
        stamina += 50f * Time.deltaTime; // instant regen, no delay
        if (stamina > 100f) stamina = 100f;
    }

    public void Consume(float amount)
    {
        stamina -= amount; // can go negative, no bool return
    }
}
