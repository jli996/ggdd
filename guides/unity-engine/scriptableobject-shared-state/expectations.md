# Expectations: scriptableobject-shared-state

After applying this guide, the agent's `Assets/Scripts/GameSettings.cs` should:

1. Declare a `class GameSettings : ScriptableObject`.
2. Have a `[CreateAssetMenu(...)]` attribute on the class.
3. NOT declare a `static GameSettings Instance` field or property.
4. NOT use `DontDestroyOnLoad`.
5. Have at least one serialized field (e.g. `musicVolume`).
6. Not extend `MonoBehaviour`.
