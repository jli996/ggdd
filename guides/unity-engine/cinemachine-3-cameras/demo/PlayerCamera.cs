using UnityEngine;
using Unity.Cinemachine;

public class PlayerCamera : MonoBehaviour
{
    [SerializeField] private CinemachineCamera followCam;
    [SerializeField] private CinemachineCamera aimCam;
    [SerializeField] private Transform target;

    void Start()
    {
        followCam.Target.TrackingTarget = target;
        followCam.Priority = 10;
        aimCam.Priority = 5;
    }

    public void EnterAimMode()
    {
        followCam.Priority = 5;
        aimCam.Priority = 15;
    }
}
