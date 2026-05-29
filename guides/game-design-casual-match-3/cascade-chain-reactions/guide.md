---
id: cascade-chain-reactions
category: game-design-casual-match-3
title: Cascade chain reactions (escalating bonus per chain step)
description: When matched tiles vanish and tiles fall into new matches, each additional chain step should award an escalating bonus. Cap chain length to prevent infinite loops with cascading specials.
useCases:
  - "implement match-3 cascade scoring system"
  - "add chain reaction bonuses to puzzle game"
  - "prevent infinite cascade loops in match-3"
  - "tune cascade delay timing for visual feedback"
  - "balance escalating chain multipliers in Candy Crush style game"
relatedGuides: []
appliesTo:
  - "match-3 puzzle games with falling tile mechanics"
tags: [puzzle, casual, match-3, replayability, mobile-first, game-feel]
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Cascade chain reactions

In Candy Crush and Royal Match, a single swipe often triggers a cascade: matched tiles vanish, tiles above fall, land in new match patterns, vanish again, repeat. Each cascade step (chain) should feel increasingly exciting — award escalating bonuses to reward skilled play and to telegraph to the player that something special is happening.

## Implementation

```csharp
using UnityEngine;

public class MatchCascade : MonoBehaviour
{
    [SerializeField] private int maxChainLength = 8;
    [SerializeField] private float chainBonusMultiplier = 0.5f;
    [SerializeField] private float perChainStepDelaySeconds = 0.18f;

    /// Returns score for this chain step. Chain index 0 = first match (no bonus).
    /// Chain index 1 = second match in cascade (+50%), index 2 (+100%), etc.
    public float ScoreForChainStep(int baseScore, int chainIndex)
    {
        return baseScore * (1 + chainIndex * chainBonusMultiplier);
    }

    /// Returns true if the cascade has reached the maximum allowed chain length.
    public bool ShouldAbortChain(int currentChainLength)
    {
        return currentChainLength >= maxChainLength;
    }
}
```

## Avoid

- Flat scoring across all chain steps — if chain 3 earns the same as chain 1, the player has no reason to care about cascades.
- No chain cap — cascading specials (color bombs, line bombs) can trigger each other infinitely; always enforce a `maxChainLength` ceiling.
- Very long per-step delays (`perChainStepDelaySeconds > 0.5`) — the visual rhythm becomes sluggish; 0.15-0.25 seconds is the Candy Crush sweet spot.
- Bonus multipliers above 2.0 per step — at chain 5 the score would be ×10 the base, which can unbalance leaderboards.

## Gotchas

- `chainIndex` is zero-based in the implementation above: the first match in a move is index 0 (score × 1.0), the second is index 1 (score × 1.5), and so on. Clarify this convention in comments to avoid off-by-one errors.
- Special tiles (line bombs, color bombs) triggered inside a cascade should inherit the current chain index so their bonus is consistent, not recalculated from zero.
- On mobile, delay `perChainStepDelaySeconds` slightly longer on lower-end devices — the physics/gravity animation needs time to settle before the next match evaluation.
- Bejeweled Blitz caps chains at 10 and awards a distinct sound cue per step; audio feedback is as important as the score multiplier for player satisfaction.
</content>
