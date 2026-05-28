using UnityEngine;

public class OneInputControl : MonoBehaviour
{
    public enum InputMode { SingleTap, TapAndHold, SingleSwipe }

    [SerializeField] private InputMode mode = InputMode.SingleTap;
    [SerializeField] private bool requiresTwoFingers = false;

    public void OnTap()
    {
        if (mode == InputMode.SingleTap) HandleTap();
    }

    public void OnHoldStart()
    {
        if (mode == InputMode.TapAndHold) HandleHoldStart();
    }

    public void OnHoldEnd()
    {
        if (mode == InputMode.TapAndHold) HandleHoldEnd();
    }

    public void OnSwipe(Vector2 delta)
    {
        if (mode == InputMode.SingleSwipe) HandleSwipe(delta);
    }

    public bool IsHyperCasualValid()
    {
        return requiresTwoFingers == false;
    }

    private void HandleTap()       { }
    private void HandleHoldStart() { }
    private void HandleHoldEnd()   { }
    private void HandleSwipe(Vector2 delta) { }
}
