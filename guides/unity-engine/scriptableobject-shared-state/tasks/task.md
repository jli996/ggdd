# Task

`Assets/Scripts/GameSettings.cs` currently implements a singleton `MonoBehaviour` with `DontDestroyOnLoad` and a `static Instance` accessor. Refactor it into a `ScriptableObject` with a `[CreateAssetMenu]` attribute. Keep the same fields (`musicVolume`, `sfxVolume`, `targetFrameRate`). Drop the singleton accessor and the `DontDestroyOnLoad` call.
