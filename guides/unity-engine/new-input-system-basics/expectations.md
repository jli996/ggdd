# Expectations: new-input-system-basics

After applying this guide, the agent's modified C# should:

1. Import `UnityEngine.InputSystem`.
2. Bind input via an `InputActionAsset` or `InputAction` field rather than `Input.GetKey`/`Input.GetAxis`.
3. Read values with `action.ReadValue<T>()` or subscribe to `action.performed`.
4. Not use `UnityEngine.Input` static methods (`Input.GetKey`, `Input.GetAxis`, `Input.GetButton`, etc.).
