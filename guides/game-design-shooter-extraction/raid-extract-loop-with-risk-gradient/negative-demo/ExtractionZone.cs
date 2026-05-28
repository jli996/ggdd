using UnityEngine;

public class ExtractionZone : MonoBehaviour
{
    // Always open. Flat reward. No risk gradient.
    public bool IsOpen => true;
    public float RewardForExtract(float baseLoot) => baseLoot;
}
