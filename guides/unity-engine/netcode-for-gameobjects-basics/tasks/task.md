# Task

`Assets/Scripts/PlayerNetwork.cs` currently uses raw `System.Net.Sockets` for damage propagation. Refactor it to use Netcode for GameObjects:
- Replace `MonoBehaviour` with `NetworkBehaviour`.
- Replace the plain `int health` field with a `NetworkVariable<int> healthVar`.
- Replace the socket send with a `[ServerRpc]` `TakeDamageServerRpc(int amount)`.
- Add a `[ClientRpc]` `OnDeathClientRpc()` to broadcast death VFX to all clients.
