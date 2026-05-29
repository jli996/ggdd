---
id: new-input-system-basics
category: unity-engine
title: New Input System basics (Unity 6)
description: Use Unity's Input System package over the legacy Input Manager for keyboard, mouse, gamepad, and touch handling.
useCases:
  - "read player input in Unity"
  - "handle keyboard input in Unity"
  - "handle gamepad input in Unity"
  - "replace legacy Input.GetKey with new Input System"
  - "set up Input Actions in Unity"
relatedGuides: []
appliesTo:
  - "any MonoBehaviour reading per-frame input"
tags: [unity-engine, modern-api, forgiving-input]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# New Input System basics

Unity 6 ships the [Input System package](https://docs.unity3d.com/Packages/com.unity.inputsystem@1.7/manual/index.html) as the default. The legacy `UnityEngine.Input` API (`Input.GetKey`, `Input.GetAxis`) is still present for backward compatibility, but new code should use the Input System.

## Use the Input System package

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private InputActionAsset inputActions;
    private InputAction moveAction;

    void OnEnable()
    {
        moveAction = inputActions.FindActionMap("Player").FindAction("Move");
        moveAction.Enable();
    }

    void OnDisable() => moveAction.Disable();

    void Update()
    {
        Vector2 move = moveAction.ReadValue<Vector2>();
        transform.Translate(new Vector3(move.x, 0f, move.y) * Time.deltaTime);
    }
}
```

## Avoid

- `UnityEngine.Input.GetKey`, `Input.GetAxis`, `Input.GetButton` — these read from the legacy Input Manager which is *separately* configured under Project Settings → Input Manager. Modern projects should not mix the two.
- Hard-coding `KeyCode.Space` etc. in gameplay scripts. Bind inputs in an `.inputactions` asset so rebinding works.

## Gotchas

- The Input System requires `Active Input Handling` set to `Input System Package (New)` or `Both` in Project Settings → Player. Pure `Input System Package (New)` is preferred.
- `Action.ReadValue<T>()` returns a fresh value each call — no need to cache.
- For UI, use `InputSystemUIInputModule` on the EventSystem in place of the legacy `StandaloneInputModule`.
