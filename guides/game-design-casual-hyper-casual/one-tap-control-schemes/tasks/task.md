# Task

Implement `Assets/Scripts/OneInputControl.cs`. Provide:
- `InputMode` enum with ≥3 values (SingleTap, TapAndHold, SingleSwipe).
- `[SerializeField] bool requiresTwoFingers = false` (MUST default to false for hyper-casual).
- `IsHyperCasualValid()` returning `requiresTwoFingers == false`.
- At least 2 single-input handlers: OnTap(), OnHoldStart(), OnHoldEnd(), OnSwipe(Vector2 delta).
</content>
