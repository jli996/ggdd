# Expectations: non-fighting-camera

After applying this guide, the agent's `Assets/Scripts/CollectathonCamera.cs` should:

1. Have a serialized `orbitDistance` float field.
2. Have a serialized `autoFrameEnabled` bool field.
3. Have a serialized `manualOverridePriority` field (int or float) for Cinemachine priority blending.
4. Have a serialized `useCinemachine3` bool field indicating Cinemachine 3 integration intent.
5. Expose `ShouldYieldToPlayer(bool isPlayerInputtingCamera)` returning true while the player is actively steering or within the grace period.
