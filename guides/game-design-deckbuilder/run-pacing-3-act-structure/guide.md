---
id: run-pacing-3-act-structure
category: game-design-deckbuilder
title: Three-act run pacing for roguelite deckbuilders
description: Structure a roguelite run as three escalating acts with distinct difficulty curves, encounter pools, and rest beats. Avoids the "flat difficulty" trap.
useCases:
  - "pace a roguelite run"
  - "design encounter progression"
  - "Slay the Spire style act structure"
  - "deckbuilder difficulty curve"
  - "rest sites and elite encounters"
relatedGuides: []
appliesTo:
  - "any single-run roguelite or deckbuilder with a fixed-length progression"
---

# Three-act run pacing

Successful roguelite deckbuilders (Slay the Spire, Monster Train, Inscryption) share a near-universal pacing structure: a single run is broken into 3 escalating **acts**, each with distinct content pools and a recognizable rhythm. The structure exists because:

1. **Buildcraft phases need difficulty rest beats.** A flat curve denies the player time to draft and feel their build.
2. **Act boundaries are bookmarks.** Players remember "I died on Act 2's boss" as a memory beat.
3. **Pool resets keep encounters fresh.** Act 1 enemies overstay their welcome by Act 3.

## Canonical 3-act shape

| Act | Encounters | Elites | Bosses | Rest opportunities |
|---|---|---|---|---|
| 1 (intro) | ~6–8 easy fights | 1–2 mid-act | 1 boss | 1–2 rest sites |
| 2 (mid) | ~8–10 fights of increased complexity | 2–3 elites | 1 boss | 2 rest sites |
| 3 (climax) | ~6–8 hard fights | 2 elites | Final boss | 1 rest site |

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "RunActConfig", menuName = "Game/Run Act Config")]
public class RunActConfig : ScriptableObject
{
    [System.Serializable]
    public class Act
    {
        public int normalEncounterCount = 7;
        public int eliteCount = 2;
        public int restSiteCount = 2;
        public bool endsInBoss = true;
    }

    public Act act1 = new Act { normalEncounterCount = 7, eliteCount = 1, restSiteCount = 2 };
    public Act act2 = new Act { normalEncounterCount = 9, eliteCount = 3, restSiteCount = 2 };
    public Act act3 = new Act { normalEncounterCount = 7, eliteCount = 2, restSiteCount = 1 };
}
```

## Avoid

- **Single flat encounter list.** Players burn out on Act 1 enemies by encounter 15.
- **Act 3 with rest sites equal to or greater than Act 2.** Climax acts should withhold rest to build tension.
- **No elite encounters.** Elites are the buildcraft check that separates "this build is working" from "lucky draft." Without them, the run feels lottery-driven.

## Gotchas

- Rest sites should be both healing AND upgrade — a single-purpose rest leaves players who don't need that purpose with a dead beat.
- Boss encounters should drop the highest tier of rewards but also have run-defining drawbacks (e.g., relic + curse, big heal but lose a card).
- The number of choices at each node (typically 2–3) matters more than the count of nodes; over-branching dilutes consequence.
