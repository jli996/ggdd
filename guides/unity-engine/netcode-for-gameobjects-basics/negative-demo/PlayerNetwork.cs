using UnityEngine;
using System.Net.Sockets;
using System.Text;

public class PlayerNetwork : MonoBehaviour
{
    [SerializeField] private string serverHost = "127.0.0.1";
    [SerializeField] private int serverPort = 9000;
    private int health = 100;

    public void TakeDamage(int amount)
    {
        health = Mathf.Max(0, health - amount);
        using var client = new TcpClient(serverHost, serverPort);
        using var stream = client.GetStream();
        var bytes = Encoding.UTF8.GetBytes($"damage:{amount}");
        stream.Write(bytes, 0, bytes.Length);
    }
}
