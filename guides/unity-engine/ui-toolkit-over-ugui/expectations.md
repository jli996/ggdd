# Expectations: ui-toolkit-over-ugui

After applying this guide, the agent's `Assets/Scripts/MainMenu.cs` should:

1. Import `UnityEngine.UIElements` (UI Toolkit namespace).
2. NOT import `UnityEngine.UI` (uGUI namespace).
3. Reference `UIDocument` and use `rootVisualElement.Q<Button>(...)` for element lookup.
4. NOT use `GetComponent<Button>()` for uGUI buttons.
5. Subscribe and unsubscribe button click handlers in OnEnable/OnDisable.
