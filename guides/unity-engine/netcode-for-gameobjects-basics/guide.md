---
id: netcode-for-gameobjects-basics
category: unity-engine
title: Netcode for GameObjects basics (Unity 6 multiplayer)
description: Use Unity's official Netcode for GameObjects package (NGO) for multiplayer: NetworkBehaviour + NetworkVariable + ServerRpc/ClientRpc. Don't write custom socket code.
useCases:
  - "Unity 6 multiplayer with Netcode for GameObjects"
  - "NetworkBehaviour vs MonoBehaviour"
  - "NetworkVariable for synced state"
  - "ServerRpc and ClientRpc"
  - "replace custom socket code in Unity"
relatedGuides: []
appliesTo:
  - "any Unity 6 multiplayer feature where authoritative server + client prediction matters"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Netcode for GameObjects basics

For Unity 6 multiplayer, the supported path is the **Netcode for GameObjects** (NGO) package: `Unity.Netcode`. It provides authoritative-server networking with built-in client prediction hooks.

Three core primitives:
- **`NetworkBehaviour`**: drop-in replacement for `MonoBehaviour` on networked GameObjects.
- **`NetworkVariable<T>`**: a value automatically synced from server to clients.
- **`ServerRpc` / `ClientRpc`**: methods marked with these attributes are RPC calls — `ServerRpc` runs on the server when called from a client; `ClientRpc` is the reverse.

## Implementation

```csharp
using UnityEngine;
using Unity.Netcode;

public class PlayerNetwork : NetworkBehaviour
{
    private NetworkVariable<int> healthVar = new NetworkVariable<int>(
        100,
        NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server);

    public int Health => healthVar.Value;

    [ServerRpc]
    public void TakeDamageServerRpc(int amount)
    {
        if (!IsServer) return;
        healthVar.Value = Mathf.Max(0, healthVar.Value - amount);
        if (healthVar.Value == 0) OnDeathClientRpc();
    }

    [ClientRpc]
    private void OnDeathClientRpc()
    {
        // play death VFX on every client
    }
}
```

## Avoid

- Custom `System.Net.Sockets` socket code in gameplay — NGO handles serialization, ordering, and reliability for you.
- `MonoBehaviour` for networked entities — use `NetworkBehaviour` so spawn/despawn is managed.
- Plain fields for synced state — use `NetworkVariable<T>` so client/server stay in sync.
- Public methods that the client calls expecting server execution — mark with `[ServerRpc]` and rename `XxxServerRpc()`.

## Gotchas

- `NetworkVariable` field MUST be initialized at declaration; can't be assigned in Start.
- RPC methods MUST end with `ServerRpc` or `ClientRpc` suffix — NGO uses naming to wire dispatching.
- `IsServer` / `IsClient` / `IsOwner` are inherited from `NetworkBehaviour` — use them to gate logic.
- `NetworkVariable<T>` requires `T` to be either an unmanaged type (int, float, Vector3) or `INetworkSerializable`. Strings are special-cased via `FixedString*` types.
