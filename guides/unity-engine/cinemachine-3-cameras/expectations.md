# Expectations: cinemachine-3-cameras

After applying this guide, the agent's `Assets/Scripts/PlayerCamera.cs` should:

1. Import `Unity.Cinemachine` (CM3 namespace).
2. NOT import `Cinemachine` (CM2 namespace).
3. Declare `CinemachineCamera` field(s) — NOT `CinemachineVirtualCamera` (CM2 type).
4. NOT manipulate `Camera.transform` to switch cameras (use Priority instead).
5. Use `.Priority` to control which camera is active.
