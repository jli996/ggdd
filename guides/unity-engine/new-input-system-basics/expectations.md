# Expectations: new-input-system-basics

After applying this guide, the agent's modified `Assets/Scripts/PlayerController.cs` should:

1. Import `UnityEngine.InputSystem` (`using UnityEngine.InputSystem;`).
2. Declare an `InputActionAsset` (or `InputAction`) serialized field.
3. Read movement via `action.ReadValue<Vector2>()` (or `subscribe to action.performed`).
4. Contain NO references to `UnityEngine.Input.GetAxis`, `Input.GetKey`, `Input.GetButton`, or `Input.GetMouseButton`.
5. Not import `System.Linq` (not needed for input handling; signals over-import).
6. Still declare a `PlayerController` class extending `MonoBehaviour`.
