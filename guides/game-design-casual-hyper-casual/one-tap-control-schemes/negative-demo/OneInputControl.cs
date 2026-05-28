using UnityEngine;

// Anti-pattern: virtual joystick, multi-touch gestures, requiresTwoFingers = true.
public class OneInputControl : MonoBehaviour
{
    public bool requiresTwoFingers = true; // Breaks hyper-casual accessibility

    public Vector2 joystickAxis; // Virtual joystick — not hyper-casual

    private void Update()
    {
        if (Input.touchCount == 2)
        {
            // Multi-touch pinch gesture — disqualifying anti-pattern
            Touch t0 = Input.GetTouch(0);
            Touch t1 = Input.GetTouch(1);
            joystickAxis = (t0.position + t1.position) / 2f;
        }
    }
}
