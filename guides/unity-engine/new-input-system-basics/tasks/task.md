# Task

The file `Assets/Scripts/PlayerController.cs` reads input via the legacy `Input.GetAxis("Horizontal")` / `Input.GetAxis("Vertical")`. Refactor it to use Unity's Input System package instead, binding to an `InputAction` named `Move` that returns a `Vector2`.

Do not change the player movement behavior — only the input source.
