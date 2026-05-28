# Task

`Assets/Scripts/MainMenu.cs` uses uGUI (`UnityEngine.UI`, `Canvas`, `Button.onClick`). Migrate it to UI Toolkit:
- Replace `UnityEngine.UI` import with `UnityEngine.UIElements`.
- Replace `Button` (uGUI type) lookups with `UIDocument.rootVisualElement.Q<Button>("name")`.
- Use `button.clicked += handler` (and unsubscribe in OnDisable).
