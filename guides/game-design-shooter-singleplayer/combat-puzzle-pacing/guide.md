---
id: combat-puzzle-pacing
category: game-design-shooter-singleplayer
title: Combat puzzle pacing (encounter as resource-management puzzle)
description: "In a singleplayer FPS, each combat encounter is a small puzzle: limited ammo, varied enemy types, environment hazards. The puzzle is which tools to use where."
useCases:
  - "design FPS combat encounters"
  - "DOOM 2016 push-forward combat"
  - "resource management between encounters"
  - "enemy variety per encounter"
  - "FPS arena design"
relatedGuides: []
appliesTo:
  - "any singleplayer FPS or action game with combat-puzzle encounters"
tags: [shooter, singleplayer-shooter, pacing, combat, economy]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Combat puzzle pacing

Singleplayer FPS combat encounters are mini-puzzles: which weapon for which enemy, when to take cover, when to be aggressive. DOOM 2016 codified this: the "push-forward" loop where killing enemies generates ammo, so the answer to running out of bullets is to be MORE aggressive, not less.

Design knobs per encounter:
1. **Enemy variety** — 2-4 enemy types per encounter, each weak/strong to different weapons
2. **Resource flow** — ammo/health drops scale with encounter difficulty; players leave fights at ~70% resources for the next
3. **Encounter beats** — wave 1 introduces, wave 2 escalates, wave 3 reaches climax

## Implementation

```csharp
using UnityEngine;

[System.Serializable]
public class EnemyWave
{
    public string[] enemyTypes;     // 2-4 distinct types
    public int totalEnemyCount;     // 3-12 typical
    public float intensityCurve;    // 0=easy, 1=hard
}

public class CombatEncounter : MonoBehaviour
{
    [SerializeField] private EnemyWave[] waves;
    [SerializeField] private int ammoDropMin = 20;
    [SerializeField] private int ammoDropMax = 60;
    [SerializeField] private float postEncounterHealthFraction = 0.7f;

    public bool IsValid()
    {
        if (waves == null || waves.Length < 2) return false;
        foreach (var w in waves)
        {
            if (w.enemyTypes == null || w.enemyTypes.Length < 2) return false;
        }
        return true;
    }
}
```

## Avoid

- Single enemy type per encounter — no puzzle; just spam the one weapon that works.
- Same enemy count every encounter — pacing flattens.
- 100% resource refill between encounters — no scarcity, no decision-making.
- No enemy variety across waves — wave 1 is identical to wave 5.

## Gotchas

- The "intensity curve" should NOT monotonically increase — drop intensity briefly after big setpieces so the player can breathe.
- Enemy variety per wave should rotate, not just add — wave 3 introducing the same enemy from wave 1 plus more feels bigger but isn't actually a new puzzle.
- Post-encounter health fraction is the lever for difficulty: 0.5 = brutal, 0.7 = standard, 0.9 = forgiving.
