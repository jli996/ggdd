using UnityEngine;

public class GameSettings : MonoBehaviour
{
    public static GameSettings Instance;
    public float musicVolume = 0.7f;
    public float sfxVolume = 0.9f;
    public int targetFrameRate = 60;

    void Awake()
    {
        if (Instance != null) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }
}
