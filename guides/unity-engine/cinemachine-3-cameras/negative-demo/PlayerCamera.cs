using UnityEngine;
using Cinemachine;  // CM2 legacy namespace

public class PlayerCamera : MonoBehaviour
{
    [SerializeField] private CinemachineVirtualCamera followCam;  // CM2 type
    [SerializeField] private Camera mainCam;

    public void EnterAimMode()
    {
        // Anti-pattern: hand-coded camera switch.
        mainCam.transform.position = followCam.transform.position;
        mainCam.transform.rotation = followCam.transform.rotation;
    }
}
