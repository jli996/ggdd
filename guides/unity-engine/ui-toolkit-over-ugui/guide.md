---
id: ui-toolkit-over-ugui
category: unity-engine
title: UI Toolkit over uGUI (Unity 6 modern UI)
description: For new runtime and editor UI in Unity 6, use UI Toolkit (UXML/USS + UIElements). uGUI (Canvas + Text + Button MonoBehaviours) remains for world-space UI and legacy projects.
useCases:
  - "modern UI in Unity 6"
  - "UI Toolkit vs uGUI"
  - "UXML and USS for Unity UI"
  - "replace Canvas with UIDocument"
  - "runtime UI without GameObjects"
relatedGuides: []
appliesTo:
  - "any Unity 6 project building new runtime UI (menus, HUDs, editor tools)"
tags: [unity-engine, modern-api, quality-of-life]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# UI Toolkit over uGUI

Unity 6 has two UI systems:

- **UI Toolkit** (`UnityEngine.UIElements`): markup (UXML) + styling (USS) + runtime via `UIDocument`. Web-developer-friendly. Recommended for new menus, HUDs, settings screens, and ALL editor UI.
- **uGUI** (`UnityEngine.UI`): GameObject + Canvas + Text/Image/Button MonoBehaviours. Recommended only for world-space UI (nameplates floating in 3D space) and legacy projects.

## Use UI Toolkit for new menus

```csharp
using UnityEngine;
using UnityEngine.UIElements;

public class MainMenu : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument;
    private Button playButton;
    private Button settingsButton;

    void OnEnable()
    {
        var root = uiDocument.rootVisualElement;
        playButton = root.Q<Button>("play-button");
        settingsButton = root.Q<Button>("settings-button");
        playButton.clicked += OnPlayClicked;
        settingsButton.clicked += OnSettingsClicked;
    }

    void OnDisable()
    {
        if (playButton != null) playButton.clicked -= OnPlayClicked;
        if (settingsButton != null) settingsButton.clicked -= OnSettingsClicked;
    }

    private void OnPlayClicked() { /* ... */ }
    private void OnSettingsClicked() { /* ... */ }
}
```

The UI itself lives in a `.uxml` file referenced by the `UIDocument` component.

## Avoid

- `using UnityEngine.UI;` for new menus — that's uGUI (legacy for screen UI in Unity 6).
- `GetComponent<Button>()` on a Canvas-attached GameObject (uGUI). Use `root.Q<Button>("name")` (UI Toolkit) instead.
- `Text.text = "..."` (uGUI). Use `Label.text = "..."` (UI Toolkit).
- A scene full of UI GameObjects for screen UI. A `UIDocument` is one GameObject; the UI tree lives in UXML.

## Gotchas

- UI Toolkit's `Button` is `UnityEngine.UIElements.Button`, distinct from uGUI's `UnityEngine.UI.Button`. Don't confuse them.
- `root.Q<T>("name")` returns null if the element isn't found — handle gracefully or assert during dev.
- For world-space UI (3D nameplates), uGUI's Canvas remains the right tool. UI Toolkit is screen-space-first.
- Unsubscribe (`clicked -= ...`) in `OnDisable` to avoid leaks on scene reload.
