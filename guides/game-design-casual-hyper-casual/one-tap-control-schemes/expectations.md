# Expectations: one-tap-control-schemes

After applying this guide, the agent's `Assets/Scripts/OneInputControl.cs` should:

1. Define an `InputMode` enum with at least 3 values (e.g., SingleTap, TapAndHold, SingleSwipe).
2. Declare a `requiresTwoFingers` bool field that defaults to `false` — this is the hyper-casual validity constraint.
3. Implement an `IsHyperCasualValid()` method that returns a bool.
4. `IsHyperCasualValid()` must reference `requiresTwoFingers` in its body (the check is `requiresTwoFingers == false`).
5. Implement at least 2 single-input handler methods (e.g., OnTap, OnSwipe, OnHoldStart, OnHoldEnd).
</content>
