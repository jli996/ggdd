using UnityEngine;

// Anti-pattern: binary aware/unaware, no enum, no hysteresis cooldown.
public class AlertState : MonoBehaviour
{
    public bool isAlert = false; // binary — no states, no cooldown

    public void SetAlert(bool alert)
    {
        isAlert = alert; // instantly flips — no hysteresis, no state machine
    }
}
