---
id: single-mechanic-level-grammar
category: game-design-platformer-precision
title: Single-mechanic level grammar (introduce one wrinkle at a time)
description: In a precision platformer, each level should introduce ONE new variation on a known mechanic. Teaching two new things at once doubles failure modes and obscures which is hurting the player.
useCases:
  - "design platformer level progression"
  - "introduce mechanics one at a time"
  - "Celeste level design grammar"
  - "Mario teach-via-play"
  - "platformer difficulty curve design"
relatedGuides:
  - tight-respawn-loop
appliesTo:
  - "any precision platformer with progressive mechanic introduction"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Single-mechanic level grammar

Mario taught the world this: each level introduces ONE new thing. Level 1-1's first goombas teach "enemies." Level 1-2's invisible blocks teach "explore upward." Mixing both in level 1-1 would confuse the lesson.

Celeste codified the structure: every chapter is built around one mechanic (dashes / wind / cassette flip / dream blocks). Within a chapter, each room introduces one wrinkle on that mechanic.

## Implementation pattern

A level config that declares which mechanics it introduces. The grammar enforcement: at most ONE new mechanic per level.

```csharp
using UnityEngine;

public enum PlatformerMechanic { Walk, Jump, DoubleJump, Dash, WallJump, Crouch, GrappleHook }

[CreateAssetMenu(fileName = "LevelGrammar", menuName = "Game/Level Grammar")]
public class LevelGrammar : ScriptableObject
{
    [System.Serializable]
    public class LevelSpec
    {
        public string levelName;
        public PlatformerMechanic[] knownMechanics;     // mechanics the player has seen before
        public PlatformerMechanic[] newMechanicsIntroduced;  // SHOULD have length ≤ 1
    }

    public LevelSpec[] levels;

    public bool IsValidGrammar()
    {
        if (levels == null) return false;
        foreach (var l in levels)
        {
            if (l.newMechanicsIntroduced != null && l.newMechanicsIntroduced.Length > 1) return false;
        }
        return true;
    }
}
```

## Avoid

- Introducing 2+ new mechanics in one level — players can't isolate which is causing them to fail.
- Introducing a new mechanic in the LAST level — they don't have a chance to practice it.
- Combining new mechanic with hard precision platforming — the failure rate confuses "I'm bad" with "I haven't learned this mechanic yet."

## Gotchas

- "New mechanic" includes new combinations. A jump+dash combo is a new mechanic even if dash existed alone before.
- The first level of a new chapter should be EASIER than the last level of the previous chapter, because the player is learning a new mechanic.
- "Wrinkle" within a level (e.g., "the same dash, but timing-tight") is allowed — that's not a new mechanic, it's a tuning of the known one.
