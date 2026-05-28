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

    private void OnPlayClicked() { }
    private void OnSettingsClicked() { }
}
