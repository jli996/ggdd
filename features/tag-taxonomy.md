# ggdd tag taxonomy

Tags are a secondary, cross-cutting index over the guide corpus. Categories tell you what *kind* of game a guide is about; tags tell you what *pattern* it embodies — and patterns transfer across categories.

A guide carries 2–4 tags. Tags are used by `ggdd search` (hybrid scoring: semantic-similarity + tag-match boost), `ggdd search-tag <tag>` (explicit filter), and `ggdd tags` (catalog).

Tags must come from this canonical list. New tags require an entry here first.

---

## 1. Economic / Progression (7)

### `economy`
Resource flow design: how players earn, spend, and balance currencies. Use when a guide tunes generation rates, spend rates, conversion rules, or sink/source equilibrium. Common in survival, MMO, MOBA, idle.
**Avoid for:** guides only about ONE narrow currency mechanic — prefer `prestige-loop` / `tier-progression` if more specific.
**Cross-refs:** `cap-and-decay`, `tier-progression`, `prestige-loop`.

### `tier-progression`
Tiered upgrade or item ladder where each tier is built from the previous one. Use for merge games, crafting trees, MMO gear tiers, idle production levels.
**Avoid for:** flat one-shot upgrades (use `progression` instead).
**Cross-refs:** `exponential-scaling`, `meta-progression`.

### `exponential-scaling`
Values grow super-linearly per level/tier (typically 2–5× per step). Use when the guide's math leans on `Mathf.Pow` or geometric series. Without this, "tiers" devolve to flat additive scaling.
**Avoid for:** linear or sublinear curves (which are valid in their own right).
**Cross-refs:** `tier-progression`, `prestige-loop`, `power-curve`.

### `cap-and-decay`
Caps (storage limits, durability, raid windows) + decay (timers that remove value) — the friction layer that keeps an economy churning. Use when guides design caps, durability rules, or time-based loss.
**Avoid for:** pure currency design without expiry — that's just `economy`.
**Cross-refs:** `economy`, `friction`.

### `progression`
Player advancement that opens new content or capability (levels, world unlocks, skill trees). Broad pattern; use when no narrower tag (`tier-progression`, `meta-progression`, `prestige-loop`) fits.
**Avoid for:** numeric power-up curves — use `power-curve`.
**Cross-refs:** `meta-progression`, `narrative-beat`.

### `meta-progression`
Persistent advancement that carries across runs/sessions/games. Use for unlocks bought with run currency, character XP that survives death, prestige loops (reset-to-gain-meta-currency in idle / clicker games), or post-prestige boost math.
**Avoid for:** in-run advancement — use `progression`.
**Cross-refs:** `roguelike-run`, `exponential-scaling` (when prestige math compounds).

### `power-curve`
How a character/build/team grows in raw power over time. Use when guides design intentional power spikes, escalation, or de-escalation. Common in MOBA (lane→late), action RPG, soulslike, full-loot shooter.
**Avoid for:** stat balancing alone — use the more specific economic tag.
**Cross-refs:** `pacing`, `tier-progression`.

---

## 2. Game Feel & Control (6)

### `game-feel`
Tactile combat / movement quality. Use when the guide tunes responsiveness, weight, juice, screen-shake, hit-stop, or anything in the "feel" bucket. Action / brawler / platformer territory.
**Avoid for:** purely visual polish — use `readability`.
**Cross-refs:** `combat`, `forgiving-input`, `instant-restart`.

### `forgiving-input`
Coyote time, jump buffering, lockout-takeback windows. Use when the guide designs input tolerances that absorb human reaction-time variability.
**Avoid for:** pure input mapping (rebinding) — that's a different concern.
**Cross-refs:** `instant-restart`, `accessibility`, `game-feel`.

### `instant-restart`
Death-to-respawn under ~1s; restart should feel like a continuation, not a reset. Common in precision platformers, hyper-casual, soulslike (bonfires).
**Avoid for:** save/load systems — that's `quality-of-life`.
**Cross-refs:** `forgiving-input`, `quality-of-life`.

### `combat`
Direct combat mechanics design (attack patterns, hit resolution, defensive options, frame data). Use for guides whose subject IS combat — not just one ingredient.
**Avoid for:** combat economy / loot — use `economy` or `loot-tier`.
**Cross-refs:** `game-feel`, `telegraph-tells`, `stamina-economy`.

### `stamina-economy`
Action-cost economy: every action consumes a regenerating pool, scarcity drives decision-making. Soulslike core mechanic but also applies to fighting games (super meters), survival (energy).
**Avoid for:** general resource design — use `economy`.
**Cross-refs:** `economy`, `risk-vs-reward`.

### `telegraph-tells`
Visible cues that telegraph an upcoming action (enemy wind-ups, attack chargeups, environmental warnings). Use when the guide designs *how the player learns to read* something.
**Avoid for:** kill-feed / spectator readability — use `readability`.
**Cross-refs:** `readability`, `combat`, `accessibility`.

---

## 3. Player Experience (8)

### `risk-vs-reward`
Decisions where higher-payoff options carry higher failure cost. Use for guides about extraction zones, loot bias by danger, build-defining greed choices.
**Cross-refs:** `economy`, `stamina-economy`.

### `readability`
Players can identify state from visuals/audio at speed. Use for guides about silhouette differentiation, UI legibility, telegraph design, build-order scouting, kill-feed clarity.
**Avoid for:** narrative/story comprehension — that's `narrative-beat`.
**Cross-refs:** `telegraph-tells`, `accessibility`.

### `accessibility`
Designs that lower barriers — input forgiveness, color-safety, control simplicity, sub-game-feel handholds for new players, anti-grief mitigations. Use both for literal accessibility (a11y) AND for casual on-ramp design.
**Cross-refs:** `forgiving-input`, `one-tap`, `readability`.

### `pacing`
Time-shaped player experience: when intense moments hit, when rest beats let players breathe. Use for act-structure guides, set-piece cadence, encounter-pacing.
**Cross-refs:** `narrative-beat`, `variety`.

### `narrative-beat`
Gameplay events that double as story chapter breaks (weapon unlocks, character introductions, set-piece climaxes). Use when the guide treats a gameplay element as story-driving.
**Avoid for:** pure cutscene/dialog design — that's outside ggdd's scope.
**Cross-refs:** `pacing`, `progression`.

### `variety`
Anti-monotony design: rotation, set-piece breaks, encounter mix, mechanic variation. Use when the guide's principle is "avoid sameness."
**Cross-refs:** `pacing`.

### `replayability`
Designs that make repeat play interesting (run variance, optimal-path racing, build diversity, finish-line gates). Common in roguelite, lane-switch, racing.
**Cross-refs:** `roguelike-run`, `meta-progression`.

### `quality-of-life`
Friction-reduction patterns: anti-stuck mechanisms, hint systems, undo, sell-mechanics, save anywhere. Use when the guide's purpose is removing avoidable annoyance.
**Avoid for:** core gameplay tuning — use the appropriate mechanical tag.
**Cross-refs:** `accessibility`.

---

## 4. Multiplayer / Persistence (5)

### `pvp`
Player-versus-player design space — anything competitive between humans. Use for round-economy guides, draft systems, matchmaking, snowball caps, anti-griefing.
**Cross-refs:** `coop`, `power-curve`.

### `coop`
Player-versus-environment cooperation: shared difficulty, revive rules, scaling, friendly fire policies.
**Cross-refs:** `pvp` (sometimes apply to both), `mmo`.

### `persistent-world`
The world continues to exist (and progress) when the player logs off. Survival shooters, MMORTS, MMOs. Use when the guide cares about state that survives sessions.
**Cross-refs:** `mmo`, `offline-progress`.

### `mmo`
Massively-multiplayer specific patterns (clan/guild structures, raid coordination, server-side persistence at scale). Use sparingly — most MMO guides are also `persistent-world` or `coop`.
**Cross-refs:** `coop`, `persistent-world`.

### `offline-progress`
Game generates progress while the player isn't playing. Idle clickers, MMORTS build queues, mobile resource generators. Use when the guide tunes offline rates or caps.
**Cross-refs:** `mobile-first`, `mmo`.

---

## 5. Mechanics (5)

### `class-design`
Multi-class / multi-role / multi-character system design: orthogonality, counters, draft, balance across roles.
**Avoid for:** single-character / single-build games.
**Cross-refs:** `pvp`, `power-curve`.

### `state-machine`
Discrete-state systems with transitions, often gated by hysteresis or cooldowns. AI alert states, animation states, game-phase machines.
**Cross-refs:** `ai-perception`, `combat`.

### `ai-perception`
Non-player-character perception design: vision cones, alert states, sound propagation, investigation behavior. The "AI" substrate for stealth, horror, and companion behavior.
**Cross-refs:** `state-machine`, `combat`.

### `rarity-tiers`
Tiered item/loot/card design where rarity gates breadth (or power, deliberately or not). Use for card-rarity guides, loot tiers, relic tiers.
**Avoid for:** flat numeric tiers — that's `tier-progression`.
**Cross-refs:** `loot-tier`, `power-curve`.

### `procedural-content`
Algorithmically-generated content: maps, levels, encounters, loot drops. Use when the guide's subject is generation strategy (chunk-based, reverse-shuffle, weighted random).
**Cross-refs:** `replayability`, `roguelike-run`.

---

## 6. Genre / Platform Context (4)

### `mobile-first`
Designed for mobile play patterns: short sessions, touch input, ad integration, energy gating. Use when the design only makes sense in mobile context.
**Cross-refs:** `one-tap`, `monetization`, `offline-progress`.

### `one-tap`
Playable with one finger / one button. The hyper-casual purity bar. Use when input minimalism is the guide's POINT.
**Avoid for:** "supports touch as an option" — use `accessibility`.
**Cross-refs:** `accessibility`, `mobile-first`.

### `monetization`
Free-to-play / ads / IAP design as part of gameplay. Use for guides treating monetization AS gameplay (ad rhythm, energy walls, rewarded videos as a mechanic).
**Cross-refs:** `mobile-first`.

### `roguelike-run`
Single-run structure with permadeath + meta-progression. Use for run-pacing guides, act structures, run-economy, deckbuilders.
**Cross-refs:** `meta-progression`, `pacing`.

---

## 7. Unity Engine Tech (4)

### `modern-api`
Use of Unity 6's current / preferred API over a legacy alternative. Almost every unity-engine guide carries this. Use when the guide warns against a deprecated/legacy approach AND teaches the modern path.
**Cross-refs:** specific tech tags below.

### `performance`
Frame-time, GC, draw-call, or memory tuning. Use for perf guides where the WHY is "the game runs faster/smoother."
**Cross-refs:** `gc-free`, `pool-reuse`.

### `gc-free`
Eliminating per-frame heap allocations. Specific to hot-path Unity code. Use for guides whose subject is allocation prevention.
**Cross-refs:** `performance`, `pool-reuse`.

### `pool-reuse`
Object pooling / reuse to avoid Instantiate/Destroy cost. Use for guides about `ObjectPool<T>`, hand-rolled pools, or reuse patterns.
**Cross-refs:** `performance`, `gc-free`.

---

## Taxonomy summary

**39 tags** total across 7 groups. Each guide gets 2–4 tags.

### Quick-reference table

| Group | Count | Tags |
|---|---|---|
| Economic / Progression | 7 | economy, tier-progression, exponential-scaling, cap-and-decay, progression, meta-progression, power-curve |
| Game Feel & Control | 6 | game-feel, forgiving-input, instant-restart, combat, stamina-economy, telegraph-tells |
| Player Experience | 8 | risk-vs-reward, readability, accessibility, pacing, narrative-beat, variety, replayability, quality-of-life |
| Multiplayer / Persistence | 5 | pvp, coop, persistent-world, mmo, offline-progress |
| Mechanics | 5 | class-design, state-machine, ai-perception, rarity-tiers, procedural-content |
| Genre / Platform Context | 4 | mobile-first, one-tap, monetization, roguelike-run |
| Unity Engine Tech | 4 | modern-api, performance, gc-free, pool-reuse |

### Tag-coverage check

The full 72-guide assignment preview is in `tag-assignments-preview.md`. If gaps emerge during backfill (a guide really wants a tag not in this list), add the tag here FIRST with description + cross-refs, then assign it.

---

## Conventions

1. **Tag names use kebab-case** (lowercase, hyphenated). `tier-progression`, NOT `TierProgression` or `tier_progression`.
2. **Tags are nouns or noun-phrases**, not verbs (`progression`, not `progressing`).
3. **Tag granularity**: avoid creating a tag per guide. A tag should plausibly apply to 3+ guides across ≥2 categories.
4. **Adding a tag**: requires an entry in this file with description / cross-refs, AND ≥2 guides retroactively tagged with it. Solo-occurrence tags get rejected during PR review.
