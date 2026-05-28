---
id: set-piece-cadence
category: game-design-shooter-singleplayer
title: Set-piece cadence (break combat monotony with scripted moments)
description: A singleplayer FPS that's only combat encounters becomes monotonous. Punctuate combat with set-pieces (chase, defend, ambush, vehicle, sandbox) every 20-30 minutes of gameplay.
useCases:
  - "FPS set-piece design"
  - "break combat monotony"
  - "scripted moments in shooter"
  - "Half-Life vehicle sections"
  - "Call of Duty set-piece pacing"
relatedGuides:
  - combat-puzzle-pacing
appliesTo:
  - "any singleplayer FPS with a narrative campaign"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Set-piece cadence

A campaign of pure combat encounters — even with great combat — becomes monotonous after ~30 minutes. Set-pieces break the rhythm: a chase sequence, a defend-the-point segment, an ambush from above, a vehicle section. They give the player a different verb than "shoot enemies in a room."

## Implementation

```csharp
using UnityEngine;

public enum SetPieceType { Chase, Defend, Ambush, Vehicle, Sandbox, Stealth }

[CreateAssetMenu(fileName = "SetPieceCadence", menuName = "Game/Set-Piece Cadence")]
public class SetPieceCadence : ScriptableObject
{
    [System.Serializable]
    public class CadenceEntry
    {
        public SetPieceType type;
        public float minutesIntoMission;
        public float durationMinutes;
    }

    [SerializeField] private CadenceEntry[] cadence;
    [SerializeField] private float targetSpacingMinutes = 25f;

    public bool IsValidCadence()
    {
        if (cadence == null || cadence.Length < 2) return false;
        // Set-pieces should be spaced; check no two are closer than half the target spacing.
        for (int i = 1; i < cadence.Length; i++)
        {
            float gap = cadence[i].minutesIntoMission - cadence[i - 1].minutesIntoMission;
            if (gap < targetSpacingMinutes / 2f) return false;
        }
        return true;
    }
}
```

## Avoid

- Set-pieces every 5 minutes — feels manic, breaks combat flow entirely.
- Set-pieces only at mission end — first 90% of mission is monotonous.
- Same set-piece type repeated — "another chase!?" loses impact.
- Scripted set-pieces with no player agency — player feels passive.

## Gotchas

- Set-piece duration matters: 1-3 min works well. Longer becomes a different mode entirely (a 10min "chase" is a chase MISSION, not a chase SET-PIECE).
- Spacing of 20-30 minutes is the sweet spot. 15min feels overstuffed; 45min loses the punctuation effect.
- Variety in TYPE matters more than variety in DETAIL. Two different chases feel more samey than a chase followed by a defense.
