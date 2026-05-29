---
id: three-phase-game-arc
category: game-design-moba
title: Three-phase game arc (lane / mid / late power spikes)
description: MOBA matches have a three-phase arc (lane phase, mid game, late game) where different champion archetypes peak at different phases. Designing distinct power spikes creates variety and prevents every game from converging on the same strategy.
useCases:
  - "design moba three-phase game arc"
  - "champion power spike timing in moba"
  - "lane phase vs late game champion balance"
  - "moba match pacing and phase transitions"
  - "early game vs late game champion design"
relatedGuides: []
appliesTo:
  - "any MOBA or team-based brawler with lane phases and item scaling"
tags: [strategy, moba, pacing, power-curve, pvp]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Three-phase game arc

A MOBA with all champions peaking at the same time is a MOBA with one viable comp. The three-phase arc (Lane → Mid → Late) gives early-game bullies, mid-game roamers, and late-game hypercarries each a distinct window to dominate — ensuring every game has different decision points.

## Implementation

```csharp
using UnityEngine;
using System.Linq;

public enum GamePhase { Lane, Mid, Late }

[CreateAssetMenu(menuName = "GGDD/MobaPhases")]
public class MobaPhases : ScriptableObject
{
    [System.Serializable]
    public class ChampionPowerCurve
    {
        public string championName;
        public float lanePower;
        public float midPower;
        public float latePower;
    }

    [SerializeField] private ChampionPowerCurve[] champions;

    public float PowerInPhase(string championName, GamePhase phase)
    {
        var champ = System.Array.Find(champions, c => c.championName == championName);
        if (champ == null) return 0f;
        return phase switch
        {
            GamePhase.Lane => champ.lanePower,
            GamePhase.Mid  => champ.midPower,
            GamePhase.Late => champ.latePower,
            _ => 0f,
        };
    }

    public GamePhase PeakPhase(string championName)
    {
        var champ = System.Array.Find(champions, c => c.championName == championName);
        if (champ == null) return GamePhase.Lane;
        if (champ.lanePower >= champ.midPower && champ.lanePower >= champ.latePower)
            return GamePhase.Lane;
        if (champ.midPower >= champ.latePower)
            return GamePhase.Mid;
        return GamePhase.Late;
    }
}
```

## Avoid

- All champions having equal power across phases — no one has a window, games feel flat.
- Late game being universally dominant — late game hypercarries make every game a stall-fest.
- Ignoring lane phase bully archetypes — without early pressure, games converge immediately to objectives.
- Power curves that don't differentiate (lanePower == midPower == latePower) — prevents meaningful roster diversity.

## Gotchas

- Power values should be on a 0–10 scale for readability; use normalized ratings in the Inspector.
- `PeakPhase` should be deterministic given identical values — implement a tiebreaker (e.g., Lane wins ties).
- Adding a 4th phase (e.g., "Ultra-Late") is tempting but complicates communication to players — keep it to 3.
- The ScriptableObject data drives the meta discussion: designers can tune individual champion curves without touching code.
