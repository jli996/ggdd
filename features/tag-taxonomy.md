# ggdd tag taxonomy

Tags are a secondary, cross-cutting index over the guide corpus. Categories tell you what *kind* of game a guide is about; tags tell you what *pattern* it embodies AND what genre umbrella(s) it falls under — both of which transfer across categories.

A guide carries 3–6 tags. Tags are used by:
- `ggdd search` — hybrid scoring: semantic-similarity + max-over-guide-tags(query · tag-embedding) × boost
- `ggdd search-tag <tag>` — explicit filter
- `ggdd tags` — catalog

Tags MUST come from this canonical list. New tags require an entry here first.

---

## Two layers of tags

1. **Cross-cutting mechanical / experiential tags** (groups 1-7 below) — describe *patterns* (e.g. `tier-progression`, `risk-vs-reward`). Apply across many genres.
2. **Genre tags** (group 8 — umbrella; group 9 — subgenre) — describe *what kind of game* the guide is about. Each guide gets one umbrella + one subgenre tag.

Hybrid scoring uses both layers via embedding similarity, so a query for "MOBA design" surfaces guides tagged `moba` (subgenre) AND guides tagged `strategy` (umbrella).

---

## 1. Economic / Progression (7)

### `economy`
Resource flow design: how players earn, spend, and balance currencies. Use when a guide tunes generation rates, spend rates, conversion rules, or sink/source equilibrium. Common in survival, MMO, MOBA, idle.
**Avoid for:** guides only about ONE narrow currency mechanic — prefer `tier-progression` if more specific.
**Cross-refs:** `cap-and-decay`, `tier-progression`.

### `tier-progression`
Tiered upgrade or item ladder where each tier is built from the previous one. Use for merge games, crafting trees, MMO gear tiers, idle production levels.
**Avoid for:** flat one-shot upgrades (use `progression` instead).
**Cross-refs:** `exponential-scaling`, `meta-progression`.

### `exponential-scaling`
Values grow super-linearly per level/tier (typically 2–5× per step). Use when the guide's math leans on `Mathf.Pow` or geometric series.
**Avoid for:** linear or sublinear curves.
**Cross-refs:** `tier-progression`, `power-curve`.

### `cap-and-decay`
Caps (storage limits, durability, raid windows) + decay (timers that remove value) — the friction layer that keeps an economy churning.
**Cross-refs:** `economy`.

### `progression`
Player advancement that opens new content or capability (levels, world unlocks, skill trees). Use when no narrower tag (`tier-progression`, `meta-progression`) fits.
**Cross-refs:** `meta-progression`, `narrative-beat`.

### `meta-progression`
Persistent advancement that carries across runs/sessions/games. Use for unlocks bought with run currency, character XP that survives death, prestige loops (reset-to-gain-meta-currency in idle / clicker games), or post-prestige boost math.
**Avoid for:** in-run advancement — use `progression`.
**Cross-refs:** `roguelike-run`, `exponential-scaling`.

### `power-curve`
How a character/build/team grows in raw power over time. Use when guides design intentional power spikes, escalation, or de-escalation. Common in MOBA (lane→late), action RPG, soulslike, full-loot shooter.
**Cross-refs:** `pacing`, `tier-progression`.

---

## 2. Game Feel & Control (6)

### `game-feel`
Tactile combat / movement quality. Use when the guide tunes responsiveness, weight, juice, screen-shake, hit-stop, or anything in the "feel" bucket.
**Cross-refs:** `combat`, `forgiving-input`, `instant-restart`.

### `forgiving-input`
Coyote time, jump buffering, lockout-takeback windows. Use when the guide designs input tolerances that absorb human reaction-time variability.
**Cross-refs:** `instant-restart`, `accessibility`, `game-feel`.

### `instant-restart`
Death-to-respawn under ~1s; restart should feel like a continuation, not a reset.
**Cross-refs:** `forgiving-input`, `quality-of-life`.

### `combat`
Direct combat mechanics design (attack patterns, hit resolution, defensive options, frame data).
**Cross-refs:** `game-feel`, `telegraph-tells`, `stamina-economy`.

### `stamina-economy`
Action-cost economy: every action consumes a regenerating pool, scarcity drives decision-making. Soulslike core but also applies to fighting games, survival.
**Cross-refs:** `economy`, `risk-vs-reward`.

### `telegraph-tells`
Visible cues that telegraph an upcoming action (enemy wind-ups, attack chargeups, environmental warnings).
**Cross-refs:** `readability`, `combat`, `accessibility`.

---

## 3. Player Experience (8)

### `risk-vs-reward`
Decisions where higher-payoff options carry higher failure cost.
**Cross-refs:** `economy`, `stamina-economy`.

### `readability`
Players can identify state from visuals/audio at speed. Silhouettes, UI legibility, telegraphs, build-order scouting, kill-feed clarity.
**Cross-refs:** `telegraph-tells`, `accessibility`.

### `accessibility`
Designs that lower barriers — input forgiveness, color-safety, control simplicity, sub-game-feel handholds for new players, anti-grief mitigations.
**Cross-refs:** `forgiving-input`, `one-tap`, `readability`.

### `pacing`
Time-shaped player experience: when intense moments hit, when rest beats let players breathe.
**Cross-refs:** `narrative-beat`, `variety`.

### `narrative-beat`
Gameplay events that double as story chapter breaks (weapon unlocks, character introductions, set-piece climaxes).
**Cross-refs:** `pacing`, `progression`.

### `variety`
Anti-monotony design: rotation, set-piece breaks, encounter mix, mechanic variation.
**Cross-refs:** `pacing`.

### `replayability`
Designs that make repeat play interesting (run variance, optimal-path racing, build diversity, finish-line gates).
**Cross-refs:** `roguelike-run`, `meta-progression`.

### `quality-of-life`
Friction-reduction patterns: anti-stuck mechanisms, hint systems, undo, sell-mechanics, save anywhere.
**Cross-refs:** `accessibility`.

---

## 4. Multiplayer / Persistence (4)

### `pvp`
Player-versus-player design space. Round-economy, draft systems, matchmaking, snowball caps, anti-griefing.
**Cross-refs:** `coop`, `power-curve`.

### `coop`
Player-versus-environment cooperation: shared difficulty, revive rules, scaling, friendly fire policies.
**Cross-refs:** `pvp`.

### `persistent-world`
The world continues to exist (and progress) when the player logs off. Survival shooters, MMORTS, MMOs.
**Cross-refs:** `offline-progress`.

### `offline-progress`
Game generates progress while the player isn't playing. Idle clickers, MMORTS build queues, mobile resource generators.
**Cross-refs:** `mobile-first`.

---

## 5. Mechanics (5)

### `class-design`
Multi-class / multi-role / multi-character system design: orthogonality, counters, draft, balance across roles.
**Cross-refs:** `pvp`, `power-curve`.

### `state-machine`
Discrete-state systems with transitions, often gated by hysteresis or cooldowns. AI alert states, animation states, game-phase machines.
**Cross-refs:** `ai-perception`, `combat`.

### `ai-perception`
NPC / AI-controller perception design: vision cones, alert states, sound propagation, investigation behavior. Cross-cutting — applies to stealth, horror, action-game enemy AI, RTS unit AI, RPG companions, sim citizens, anywhere a controlled non-player entity decides what it can see/hear.
**Cross-refs:** `state-machine`, `combat`.

### `rarity-tiers`
Tiered item/loot/card design where rarity gates breadth (or power, deliberately or not).
**Cross-refs:** `power-curve`.

### `procedural-content`
Algorithmically-generated content: maps, levels, encounters, loot drops.
**Cross-refs:** `replayability`.

---

## 6. Genre / Platform Context (4)

### `mobile-first`
Designed for mobile play patterns: short sessions, touch input, ad integration, energy gating.
**Cross-refs:** `one-tap`, `monetization`, `offline-progress`.

### `one-tap`
Playable with one finger / one button. The hyper-casual purity bar.
**Cross-refs:** `accessibility`, `mobile-first`.

### `monetization`
Free-to-play / ads / IAP design as part of gameplay.
**Cross-refs:** `mobile-first`.

### `roguelike-run`
Single-run structure with permadeath + meta-progression. Roguelite deckbuilders, action roguelikes, runner meta-progression.
**Cross-refs:** `meta-progression`, `pacing`.

---

## 7. Unity Engine Tech (4)

### `modern-api`
Use of Unity 6's current / preferred API over a legacy alternative. Almost every unity-engine guide carries this.
**Cross-refs:** specific tech tags below.

### `performance`
Frame-time, GC, draw-call, or memory tuning.
**Cross-refs:** `gc-free`, `pool-reuse`.

### `gc-free`
Eliminating per-frame heap allocations. Specific to hot-path Unity code.
**Cross-refs:** `performance`, `pool-reuse`.

### `pool-reuse`
Object pooling / reuse to avoid Instantiate/Destroy cost.
**Cross-refs:** `performance`, `gc-free`.

---

## 8. Genre Umbrella (6)

Apply to ALL guides in the relevant subgenres. Queries like "FPS design" or "puzzle game" naturally surface guides via embedding similarity against these umbrella tags.

### `shooter`
Umbrellas: shooter-survival, shooter-extraction, shooter-competitive, shooter-singleplayer (12 guides).

### `platformer`
Umbrellas: platformer-precision, platformer-momentum, platformer-3d-collectathon (9 guides).

### `strategy`
Umbrellas: rts-classic, moba, mmorts (9 guides).

### `puzzle`
Umbrellas: match-3, merge-2, color-sort (9 guides).

### `casual`
Umbrellas: ALL game-design-casual-* — match-3, merge-2, color-sort, lane-switch, clicker-idle, hyper-casual, endless-runner (21 guides). Note overlap with `puzzle`: casual-puzzle guides get BOTH umbrellas.

### `action`
Umbrellas: action-design (v1 action category) + soulslike (since soulslike is action-flavored) (6 guides).

---

## 9. Subgenre (22)

One subgenre tag per existing category, with one exception: `ai-perception` lives in Group 5 (Mechanics) instead because it's cross-cutting (any genre with NPCs can use it).

### Action / soulslike
- `action-design` — guides under `game-design-action` (3 guides)
- `soulslike` — guides under `game-design-soulslike` (3 guides)

### Deckbuilder
- `deckbuilder` — guides under `game-design-deckbuilder` (3 guides)

### Shooter (4)
- `survival-shooter`
- `extraction-shooter`
- `competitive-shooter`
- `singleplayer-shooter`

### Platformer (3)
- `precision-platformer`
- `momentum-platformer`
- `3d-collectathon`

### Strategy (3)
- `rts-classic`
- `moba`
- `mmorts`

### Casual puzzle (3)
- `match-3`
- `merge-2`
- `color-sort`

### Casual action / economy (4)
- `lane-switch`
- `clicker-idle`
- `hyper-casual`
- `endless-runner`

### Unity (2)
- `unity-engine` — guides under `unity-engine` category
- `unity-performance` — guides under `unity-performance` category

---

## Taxonomy summary

**60 tags** total across 9 groups. Each guide gets 3–6 tags = (1 umbrella where applicable) + (1 subgenre) + (2-4 cross-cutting mechanical/experiential).

### Quick-reference table

| Group | Count | Sample tags |
|---|---|---|
| 1 Economic / Progression | 7 | economy, tier-progression, exponential-scaling, … |
| 2 Game Feel & Control | 6 | game-feel, forgiving-input, combat, … |
| 3 Player Experience | 8 | risk-vs-reward, readability, pacing, … |
| 4 Multiplayer / Persistence | 4 | pvp, coop, persistent-world, offline-progress |
| 5 Mechanics | 5 | class-design, state-machine, ai-perception, rarity-tiers, procedural-content |
| 6 Genre / Platform Context | 4 | mobile-first, one-tap, monetization, roguelike-run |
| 7 Unity Engine Tech | 4 | modern-api, performance, gc-free, pool-reuse |
| 8 Genre Umbrella | 6 | shooter, platformer, strategy, puzzle, casual, action |
| 9 Subgenre | 22 | survival-shooter, match-3, moba, soulslike, … |

The full 72-guide assignment preview is in `tag-assignments-preview.md`.

---

## Conventions

1. **Tag names use kebab-case** (lowercase, hyphenated). `tier-progression`, NOT `TierProgression`.
2. **Tags are nouns or noun-phrases**, not verbs.
3. **Cross-cutting tag granularity**: a tag should plausibly apply to 3+ guides across ≥2 categories. (Subgenre tags are exempt — they're 1:1 with categories.)
4. **Adding a tag**: requires an entry here with description / cross-refs FIRST.

## Scoring algorithm

`searchUseCases` returns:

```
final_score(guide, query) =
    semantic_similarity(query_embedding, guide_embedding)
  + tag_boost_weight × max_over(guide.tags) [ similarity(query_embedding, tag_embedding) ]
```

Where:
- Each tag has its own pre-computed embedding (built once at corpus-build time, stored in `serving/lib/tag-embeddings.gen.bin`).
- `tag_boost_weight` is configurable; default `0.15`.
- `max_over(...)` rewards strong tag matches without diluting by tag count.
