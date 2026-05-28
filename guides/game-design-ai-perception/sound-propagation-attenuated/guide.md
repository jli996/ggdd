---
id: sound-propagation-attenuated
category: game-design-ai-perception
title: Attenuated sound propagation for AI hearing
description: Sound propagates through walls with attenuation, allowing AI to hear (and investigate) sounds without line of sight. Each wall reduces effective volume by a fixed dB. AI responds to the attenuated level reaching their hearing threshold.
useCases:
  - "stealth AI sound detection through walls"
  - "AI hearing range with wall attenuation"
  - "sound propagation in stealth games"
  - "AI investigates sound source"
  - "horror game AI audio cue detection"
relatedGuides:
  - alert-state-machine-hysteresis
  - cone-of-vision-falloff
appliesTo:
  - "any stealth, horror, or tactical game where AI responds to sound independently of line of sight"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Attenuated sound propagation for AI hearing

A guard in Splinter Cell who can hear you through a thin wall but not through a thick concrete wall is doing physics-inspired sound propagation. Each wall reduces the volume of a sound. If the attenuated sound is still above the guard's hearing threshold, they investigate.

This is independent of vision: a guard facing away from you in bright light may not see you, but a loud gunshot will be heard through two walls.

Key parameters:
1. **Max hearing range**: without walls, what's the furthest distance from which any sound is heard?
2. **Wall attenuation in dB**: each wall reduces effective volume by this amount (e.g. 12 dB).
3. **Audibility**: computed by inverse-square distance falloff + wall count penalty.

## Implementation

```csharp
using UnityEngine;

public class SoundPropagation : MonoBehaviour
{
    [SerializeField] private float maxHearingRangeMeters = 30f;
    [SerializeField] private float wallAttenuationDb = 12f;

    /// <summary>
    /// Returns true if a sound at `source` is audible to a listener at `listener`
    /// given `wallsBetween` solid walls between them.
    /// </summary>
    public bool IsAudible(Vector3 source, Vector3 listener, int wallsBetween)
    {
        float distance = Vector3.Distance(source, listener);
        if (distance > maxHearingRangeMeters) return false;

        // Compute relative volume: 1.0 at distance=0, falls off with distance.
        float distanceFactor = 1f - Mathf.Clamp01(distance / maxHearingRangeMeters);

        // Each wall subtracts wallAttenuationDb from a normalized 100dB source.
        float attenuatedDb = 100f - wallsBetween * wallAttenuationDb;
        if (attenuatedDb <= 0f) return false;

        // Audible if distance factor and attenuation together exceed threshold.
        float attenuationFactor = Mathf.Clamp01(attenuatedDb / 100f);
        return distanceFactor * attenuationFactor > 0.05f;
    }
}
```

## Avoid

- Wall attenuation = 0 — all walls become transparent to sound; stealth loses a dimension.
- Attenuation so high per wall that even 1 wall blocks all sound — guards become exploitable by any wall.
- Using only wall count without distance — a source 1m away through a wall should still be heard; a source 50m away in open air might not.
- Calling IsAudible on every AudioSource every frame — throttle to event-driven or 5-10Hz polling.

## Gotchas

- `wallsBetween` should be computed by a raycast that counts `WallOccluder` layer hits, not just the first hit.
- The dB model here is simplified (linear, not logarithmic). For realistic audio, use inverse-square law. The simplified version is intentional for game design tuning.
- `maxHearingRangeMeters` is the ceiling — a very loud sound (explosion) may need a separate louder-sound path that ignores or raises this ceiling.
