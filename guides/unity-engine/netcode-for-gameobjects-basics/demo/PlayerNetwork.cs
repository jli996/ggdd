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
