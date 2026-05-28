# Expectations: netcode-for-gameobjects-basics

After applying this guide, the agent's `Assets/Scripts/PlayerNetwork.cs` should:

1. Import `Unity.Netcode`.
2. Extend `NetworkBehaviour` (NOT `MonoBehaviour`) for networked entities.
3. Use `NetworkVariable<T>` for state that should be server-authoritative and synced to clients.
4. Have at least one `[ServerRpc]` method whose name ends with `ServerRpc`.
5. Have at least one `[ClientRpc]` method whose name ends with `ClientRpc`.
6. NOT import `System.Net.Sockets` or write custom socket code.
