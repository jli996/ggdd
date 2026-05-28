# Task

`Assets/Scripts/PlayerCamera.cs` currently uses CM2's `Cinemachine` namespace and `CinemachineVirtualCamera`. Migrate it to Cinemachine 3:
- `using Cinemachine;` → `using Unity.Cinemachine;`
- `CinemachineVirtualCamera` → `CinemachineCamera`
- Use `.Priority` to switch between follow / aim cameras (no `Camera.transform` manipulation).
