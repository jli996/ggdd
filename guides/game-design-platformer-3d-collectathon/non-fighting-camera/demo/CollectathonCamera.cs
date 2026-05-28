using UnityEngine;

public class CollectathonCamera : MonoBehaviour
{
    [SerializeField] private float orbitDistance = 5f;
    [SerializeField] private bool autoFrameEnabled = true;
    [SerializeField] private float autoFrameDelay = 2f;     // seconds after player stops to auto-reframe
    [SerializeField] private int manualOverridePriority = 10; // Cinemachine priority when player is steering
    [SerializeField] private bool useCinemachine3 = true;   // toggle for Cinemachine 3 integration

    private float lastPlayerCameraInputAt = -1f;

    /// <summary>
    /// Returns true if the camera should yield control to the player's orbit input
    /// rather than auto-reframing.
    /// </summary>
    public bool ShouldYieldToPlayer(bool isPlayerInputtingCamera)
    {
        if (isPlayerInputtingCamera)
        {
            lastPlayerCameraInputAt = Time.time;
            return true;
        }
        // Keep yielding for grace period after player releases input.
        return Time.time - lastPlayerCameraInputAt < autoFrameDelay;
    }
}
