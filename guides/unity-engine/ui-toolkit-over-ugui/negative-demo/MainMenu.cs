using UnityEngine;
using UnityEngine.UI;  // uGUI legacy import

public class MainMenu : MonoBehaviour
{
    [SerializeField] private Button playButton;       // uGUI Button via GetComponent or [SerializeField]
    [SerializeField] private Button settingsButton;

    void Start()
    {
        playButton.onClick.AddListener(OnPlayClicked);
        settingsButton.onClick.AddListener(OnSettingsClicked);
    }

    private void OnPlayClicked() { }
    private void OnSettingsClicked() { }
}
