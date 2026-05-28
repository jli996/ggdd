# Task

Implement `Assets/Scripts/CollectathonCamera.cs` as a MonoBehaviour. Provide:
- Serialized `orbitDistance` (float, default ~5f), `autoFrameEnabled` (bool, default true), `autoFrameDelay` (float, default ~2f), `manualOverridePriority` (int, default 10), and `useCinemachine3` (bool, default true) fields.
- `ShouldYieldToPlayer(bool isPlayerInputtingCamera)` that returns true when the player is actively providing camera input, and continues to return true for `autoFrameDelay` seconds after they stop — preventing auto-reframe from interrupting intentional camera work.
The `useCinemachine3` field signals Cinemachine 3 integration intent without requiring actual API calls in this class.
