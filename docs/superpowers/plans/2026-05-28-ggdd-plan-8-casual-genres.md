# ggdd Plan 8 — Casual Genres (21 new guides across 7 categories)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Add 7 casual-game subgenre categories with 3 guides each = 21 new guides. Brings corpus 51 → 72 guides.

- `game-design-casual-match-3` (Candy Crush, Royal Match, Bejeweled)
- `game-design-casual-merge-2` (Merge Mansion, Travel Town, Merge Dragons)
- `game-design-casual-color-sort` (Water Sort, Ball Sort, Liquid Sort)
- `game-design-casual-lane-switch` (Crowd City, Run Race 3D, Stickman Boost)
- `game-design-casual-clicker-idle` (Cookie Clicker, AdVenture Capitalist, NGU Idle)
- `game-design-casual-hyper-casual` (Crossy Road, Helix Jump, Aquapark, Stack)
- `game-design-casual-endless-runner` (Temple Run, Subway Surfers)

**Schema change required**: extend `lib/guide-validation.ts` to accept the 7 new category names. Task 1 handles this.

**Tech Stack:** Same as Plan 7a-d. Use npm.

**Branch:** `feature/plan-8-casual-genres` (off `main`, after `3568f80`).

---

## Per-task format (Tasks 2-22)

Each guide task: 6 files (guide.md + expectations.md + tasks/task.md + demo/<Class>.cs + negative-demo/<Class>.cs + grader.ts). Use Plan 7a-c templates. Calibrate: demo passes all; negative-demo fails ≥3. Commit: `feat(guides): add <id> guide + grader`.

All guides: `gradeMode: static`, `unityVersion: "6000.0"`, `baseApp: empty-unity6`.

---

## Task 1: Extend category enum

**Files:** `lib/guide-validation.ts`, `lib/guide-validation.test.ts`

- [ ] **Step 1: Update the zod enum** in `lib/guide-validation.ts` — append after the Plan 7a-c entries:

```typescript
    // Plan 8 — casual genres
    'game-design-casual-match-3',
    'game-design-casual-merge-2',
    'game-design-casual-color-sort',
    'game-design-casual-lane-switch',
    'game-design-casual-clicker-idle',
    'game-design-casual-hyper-casual',
    'game-design-casual-endless-runner',
```

- [ ] **Step 2: Append a test in `lib/guide-validation.test.ts`** exercising the 7 new values (same pattern as the Plan 7a test).

- [ ] **Step 3: Verify + commit**

```bash
node --experimental-strip-types --test lib/guide-validation.test.ts
git add lib/guide-validation.ts lib/guide-validation.test.ts
git commit -m "feat(lib): extend guide-validation category enum for Plan 8 casual genres"
```

---

## Tasks 2-4: `game-design-casual-match-3` (3 guides)

### Task 2: `cascade-chain-reactions`

**Class:** `MatchCascade` (MonoBehaviour)

Concept: when matched tiles vanish, tiles above fall and may create new matches (chain). Each chain step awards escalating bonus (×2 for chain 2, ×3 for chain 3). Cap chain length to prevent infinite loops with cascading specials.

**Demo `MatchCascade.cs` fields/methods:**
- `[SerializeField] int maxChainLength = 8;`
- `[SerializeField] float chainBonusMultiplier = 0.5f;` (each step adds 50%)
- `[SerializeField] float perChainStepDelaySeconds = 0.18f;` (visual pacing)
- `ScoreForChainStep(int baseScore, int chainIndex)` returns `baseScore * (1 + chainIndex * chainBonusMultiplier)`.
- `ShouldAbortChain(int currentChainLength)` returns true if `>= maxChainLength`.

**Negative-demo:** no chain logic, flat scoring, no cap.

**Grader (5):**
- `maxChainLength` in [4, 20]
- `chainBonusMultiplier` > 0
- `ScoreForChainStep` exists, takes (int, int)
- `ShouldAbortChain` exists and returns bool
- References `chainIndex` in scoring math

### Task 3: `special-tile-creation-thresholds`

**Class:** `SpecialTileFactory` (ScriptableObject, `[CreateAssetMenu]`)

Concept: match-4 = line bomb, match-5 = color bomb, T/L = explosion. Each match shape has a clear threshold, telegraphed visually so players learn through play.

**Demo `SpecialTileFactory.cs`:**
- `SpecialTileType` enum: None, LineBomb, ColorBomb, Explosion.
- `MatchShape` enum: Linear3, Linear4, Linear5, TShape, LShape, Square2x2.
- `SpecialThreshold` serializable: `shape (MatchShape)`, `creates (SpecialTileType)`.
- `[SerializeField] SpecialThreshold[] thresholds;`
- `WhatDoesShapeCreate(MatchShape shape)` returns the matching `SpecialTileType` (None if no entry).

**Negative-demo:** no enums, no thresholds, all matches create the same generic "bonus" tile.

**Grader (5):**
- ScriptableObject with `[CreateAssetMenu]`
- `SpecialTileType` enum with ≥4 values (including None)
- `MatchShape` enum with ≥4 values
- `SpecialThreshold` serializable inner class
- `WhatDoesShapeCreate(MatchShape)` method exists

### Task 4: `move-vs-time-limited-mode-tuning`

**Class:** `LevelMode` (ScriptableObject, `[CreateAssetMenu]`)

Concept: each level is either move-limited (counted moves) or time-limited (seconds). Mode shapes the player's strategic frame; objectives must match.

**Demo `LevelMode.cs`:**
- `ModeType` enum: MoveLimited, TimeLimited.
- `ObjectiveType` enum: ClearObstacles, CollectItems, ReachScore, DefeatBoss.
- `[SerializeField] ModeType mode = ModeType.MoveLimited;`
- `[SerializeField] int moveCount = 25;` (used if MoveLimited)
- `[SerializeField] float timeLimitSeconds = 90f;` (used if TimeLimited)
- `[SerializeField] ObjectiveType objective;`
- `BudgetLabel()` returns "25 moves" or "90 seconds" depending on mode.

**Negative-demo:** no mode distinction, only `moveCount`.

**Grader (5):**
- ScriptableObject with `[CreateAssetMenu]`
- `ModeType` enum with both MoveLimited and TimeLimited
- `ObjectiveType` enum with ≥3 values
- Has both `moveCount` and `timeLimitSeconds` serialized fields
- `BudgetLabel()` method exists, references both fields

---

## Tasks 5-7: `game-design-casual-merge-2` (3 guides)

### Task 5: `tier-progression-value-curves`

**Class:** `MergeTierProgression` (ScriptableObject, `[CreateAssetMenu]`)

Concept: n+1 tier requires 2 of tier n. nth-tier value grows super-linearly (3-5×) so jumps feel meaningful, not boring linear.

**Demo `MergeTierProgression.cs`:**
- `[SerializeField] int maxTier = 12;`
- `[SerializeField] float baseValue = 10f;`
- `[SerializeField] float perTierValueMultiplier = 3.5f;` (must be > 2 — exponential)
- `ValueForTier(int tier)` returns `baseValue * Mathf.Pow(perTierValueMultiplier, tier)`.
- `TierFromMergeCount(int sameItemMerges)` returns `Mathf.FloorToInt(Mathf.Log(sameItemMerges + 1, 2))`.

**Negative-demo:** linear value scaling (each tier = baseValue × tier), no exponential.

**Grader (5):**
- ScriptableObject with `[CreateAssetMenu]`
- `maxTier` int > 5
- `perTierValueMultiplier` > 2 (must be exponential, not linear)
- `ValueForTier(int)` uses Mathf.Pow
- `TierFromMergeCount(int)` exists

### Task 6: `generator-regen-energy-economy`

**Class:** `Generator` (MonoBehaviour)

Concept: generators produce lower-tier items on a timer OR by spending energy currency. Tune to gate play sessions without feeling stingy. Energy regenerates at ~1 per 3 minutes (mobile standard).

**Demo `Generator.cs`:**
- `[SerializeField] float energyPerItemCost = 1f;`
- `[SerializeField] float energyRegenSecondsPerUnit = 180f;` (mobile standard, 1 energy per 3 min)
- `[SerializeField] int energyMaxCap = 100;`
- `[SerializeField] float regenStartedAt;`
- `CurrentEnergy()` returns clamped energy based on elapsed time.
- `TrySpawnItem(out float remainingEnergy)` deducts cost if affordable, returns true/false.

**Negative-demo:** infinite spawning, no energy system.

**Grader (5):**
- `energyPerItemCost` serialized field > 0
- `energyRegenSecondsPerUnit` in [60, 600] (1-10 min per energy)
- `energyMaxCap` > 0
- `CurrentEnergy()` method exists
- `TrySpawnItem` takes `out float` parameter

### Task 7: `stuck-state-prevention`

**Class:** `MergeBoardGuard` (MonoBehaviour)

Concept: prevent the player from filling the board with non-mergeable items. Provide a "sell" mechanic, de-spawn timers on uncollected items, or a "garbage chute" for items the player no longer wants.

**Demo `MergeBoardGuard.cs`:**
- `[SerializeField] int boardCapacity = 36;`
- `[SerializeField] int spawnReservedSlots = 4;` (always keep at least this many open)
- `[SerializeField] float idleItemDespawnSeconds = 600f;` (10min)
- `[SerializeField] bool sellEnabled = true;`
- `CanAcceptSpawn(int currentItemCount)` returns `currentItemCount + spawnReservedSlots <= boardCapacity`.
- `WouldBeStuck(int currentItemCount, int pendingMergeCount)` returns true if currentItemCount >= boardCapacity AND pendingMergeCount == 0.

**Negative-demo:** no capacity check, no sell mechanic, no despawn.

**Grader (5):**
- `boardCapacity` serialized int > 0
- `spawnReservedSlots` > 0
- `sellEnabled` bool field
- `CanAcceptSpawn` method exists
- `WouldBeStuck` method exists, checks pendingMergeCount

---

## Tasks 8-10: `game-design-casual-color-sort` (3 guides)

### Task 8: `partial-pour-rules`

**Class:** `BottlePour` (MonoBehaviour)

Concept: water pours only if top color matches; pour fills destination from bottom; bottle has finite capacity. Codify as predictable physics-like rules.

**Demo `BottlePour.cs`:**
- `[SerializeField] int bottleCapacity = 4;`
- `CanPour(int topColorSrc, int topColorDst, int dstFillCount)` returns true if (dst empty) OR (src top color matches dst top color AND dst not full).
- `HowMuchPours(int srcCount, int dstCount, int srcTopRun)` returns the number of units that will transfer (min of contiguous-top-run AND remaining capacity).

**Negative-demo:** allows any pour, ignores color match.

**Grader (5):**
- `bottleCapacity` in [3, 8]
- `CanPour` takes (int, int, int) args (4 if `bool dstEmpty` separate)
- `HowMuchPours` returns int
- `CanPour` body references "color match" logic (the `==` comparison between src and dst top colors)
- `HowMuchPours` uses `Mathf.Min`

### Task 9: `level-solvability-guarantee`

**Class:** `ColorSortLevelGenerator` (MonoBehaviour)

Concept: random levels must always be solvable. Use REVERSE shuffling: start from a solved state (all bottles full of one color) and apply random pours to scramble. Never forward-random.

**Demo `ColorSortLevelGenerator.cs`:**
- `[SerializeField] int colorCount = 4;`
- `[SerializeField] int extraEmptyBottles = 2;`
- `[SerializeField] int scrambleStepCount = 30;`
- `[SerializeField] int randomSeed = 12345;`
- `Generate()` returns a `BottleState[]` that's guaranteed solvable (via reverse-shuffle from solved state).
- `EnsuredSolvable()` returns true (the algorithm guarantees it by construction).

**Negative-demo:** forward random placement, no solvability guarantee.

**Grader (5):**
- `scrambleStepCount` serialized int > 10
- `randomSeed` serialized for reproducibility
- `extraEmptyBottles` >= 1 (puzzles need empty bottles for any pour to be possible)
- `Generate` method exists
- `EnsuredSolvable()` returns true (signals the algorithm is reverse-shuffle, not forward-random)

### Task 10: `bottle-color-count-progression`

**Class:** `ColorSortDifficulty` (ScriptableObject, `[CreateAssetMenu]`)

Concept: difficulty progresses by adjusting ONE dimension at a time — bottle count OR color count, never both per level.

**Demo `ColorSortDifficulty.cs`:**
- `LevelDifficulty` serializable inner class: `levelNumber (int)`, `colorCount (int)`, `bottleCount (int)`, `extraEmpty (int)`.
- `[SerializeField] LevelDifficulty[] levels;`
- `IsValidProgression()` returns true only if for each consecutive pair, AT MOST ONE of (colorCount, bottleCount, extraEmpty) changed.

**Negative-demo:** all difficulty knobs change simultaneously per level.

**Grader (5):**
- ScriptableObject with `[CreateAssetMenu]`
- `LevelDifficulty` serializable inner class with the 4 fields
- `levels` array field
- `IsValidProgression` method exists
- Body references checking changes between consecutive levels (e.g., a for loop over `levels.Length`)

---

## Tasks 11-13: `game-design-casual-lane-switch` (3 guides)

### Task 11: `three-lane-geometry`

**Class:** `LaneController` (MonoBehaviour)

Concept: 3 lanes is the sweet spot. Lane width tuned for thumb-arc swipe (~6cm physical). Lane snap is instant after swipe; player never floats between lanes.

**Demo `LaneController.cs`:**
- `[SerializeField] int laneCount = 3;`
- `[SerializeField] float laneWidthMeters = 2.5f;`
- `[SerializeField] float swipeMinDistancePx = 50f;`
- `currentLane`, `targetLane` (ints).
- `OnSwipe(float deltaX)` snaps targetLane left/right within [0, laneCount-1].
- `IsValidLaneCount()` returns true only if laneCount == 3.

**Negative-demo:** continuous (non-snapping) horizontal movement, no lane concept.

**Grader (5):**
- `laneCount = 3` literal (the design says 3 specifically)
- `laneWidthMeters` in [1.5, 4.0]
- `swipeMinDistancePx` > 0
- `OnSwipe(float)` method exists
- `IsValidLaneCount` method exists

### Task 12: `crowd-accretion-formation`

**Class:** `CrowdFormation` (MonoBehaviour)

Concept: collecting units scales the crowd. Formation moves coherently (line / V / square / circle). Losing units reads as a visual cost.

**Demo `CrowdFormation.cs`:**
- `FormationShape` enum: Line, V, Square, Circle.
- `[SerializeField] FormationShape formation = FormationShape.V;`
- `[SerializeField] float unitSpacingMeters = 0.4f;`
- `units` (List<Transform>).
- `AddUnits(int count)`, `RemoveUnits(int count)`.
- `LayoutPositions()` returns Vector3[] positions per the formation shape and current unit count.

**Negative-demo:** no formation, single character, no add/remove.

**Grader (5):**
- `FormationShape` enum with ≥3 values
- `unitSpacingMeters` > 0
- `AddUnits(int)` and `RemoveUnits(int)` methods exist
- `LayoutPositions` returns array (Vector3[] or List<Vector3>)
- References `formation` field in `LayoutPositions`

### Task 13: `finish-line-multiplier-gate`

**Class:** `FinishLineMultiplier` (MonoBehaviour)

Concept: level ends with a multiplier gate (×2, ×5, ×10). Player aims for the highest. Disproportionate reward at the gate creates the level's emotional peak.

**Demo `FinishLineMultiplier.cs`:**
- `Gate` serializable: `xMultiplier (int)`, `lanePosition (int)`, `requiredCrowdSize (int)`.
- `[SerializeField] Gate[] gates;` (typically 3-5 gates at different lanes)
- `RewardForGate(int gateIndex, int crowdSize)` returns `crowdSize * gates[gateIndex].xMultiplier` if crowd meets requirement, else 0.

**Negative-demo:** flat reward, no gate concept.

**Grader (5):**
- `Gate` serializable inner class with the 3 fields
- `gates` array field
- `xMultiplier` is int (not float — design wants whole-number multipliers for readability)
- `RewardForGate(int, int)` exists
- Body references `xMultiplier` and `crowdSize` in scoring

---

## Tasks 14-16: `game-design-casual-clicker-idle` (3 guides)

### Task 14: `exponential-production-prestige-loops`

**Class:** `PrestigeSystem` (MonoBehaviour)

Concept: production doubles per upgrade tier. Players reset (prestige) to gain meta-currency that boosts the next run (5-10× faster).

**Demo `PrestigeSystem.cs`:**
- `[SerializeField] float baseProduction = 1f;`
- `[SerializeField] float perTierProductionMultiplier = 2f;` (must be > 1 for exponential)
- `[SerializeField] float prestigeBoostPerPoint = 0.10f;` (each prestige point = +10% production)
- `ProductionAtTier(int tier, int prestigePoints)` returns `baseProduction * Mathf.Pow(perTierProductionMultiplier, tier) * (1 + prestigePoints * prestigeBoostPerPoint)`.
- `PrestigePointsEarned(float totalLifetimeProduction)` returns sqrt-scaled meta-currency.

**Negative-demo:** linear production, no prestige.

**Grader (5):**
- `perTierProductionMultiplier` > 1 (must be exponential)
- `prestigeBoostPerPoint` > 0
- `ProductionAtTier` uses `Mathf.Pow`
- `PrestigePointsEarned` exists
- `ProductionAtTier` takes (int, int)

### Task 15: `multi-resource-conversion-gates`

**Class:** `ResourceConverter` (MonoBehaviour)

Concept: multiple resource streams (cookies + grandmas + heavenly chips). Conversion gates: "spend X to unlock Y rate." Avoids single-currency snowball.

**Demo `ResourceConverter.cs`:**
- `Resource` enum: Primary, Secondary, Meta.
- `ConversionRecipe` serializable: `costResource (Resource)`, `costAmount (int)`, `producesResource (Resource)`, `producesRatePerSecond (float)`.
- `[SerializeField] ConversionRecipe[] recipes;`
- `CanAfford(Resource[] balances, int recipeIndex)` returns bool.
- `ApplyConversion(Resource[] balances, int recipeIndex)` deducts cost and returns new balances.

**Negative-demo:** single resource, no conversion gates.

**Grader (5):**
- `Resource` enum with ≥3 values
- `ConversionRecipe` serializable inner class with 4 fields
- `recipes` array field
- `CanAfford(Resource[], int)` exists
- `ApplyConversion` exists

### Task 16: `offline-progress-balancing`

**Class:** `OfflineProgress` (MonoBehaviour)

Concept: game generates currency while offline at REDUCED rate (~30-50% of online). Reward returning players but never make offline strictly better than playing.

**Demo `OfflineProgress.cs`:**
- `[SerializeField] float offlineProductionMultiplier = 0.40f;` (40% of online rate)
- `[SerializeField] float maxOfflineHours = 8f;` (cap offline time)
- `[SerializeField] float lastOnlineTimestamp;`
- `OfflineEarnings(float currentRate, float now)` returns clamped earnings (capped at maxOfflineHours).

**Negative-demo:** offline produces at full rate, no time cap.

**Grader (5):**
- `offlineProductionMultiplier` in (0, 1) — must be LESS than online
- `maxOfflineHours` in [1, 48]
- `OfflineEarnings(float, float)` exists
- Uses `Mathf.Min` for the time cap
- Body references `offlineProductionMultiplier`

---

## Tasks 17-19: `game-design-casual-hyper-casual` (3 guides)

### Task 17: `one-tap-control-schemes`

**Class:** `OneInputControl` (MonoBehaviour)

Concept: game playable with one finger. Complexity from level design, not input. Tap-and-hold vs single-tap are the only options.

**Demo `OneInputControl.cs`:**
- `InputMode` enum: SingleTap, TapAndHold, SingleSwipe.
- `[SerializeField] InputMode mode = InputMode.SingleTap;`
- `[SerializeField] bool requiresTwoFingers = false;` (MUST be false for hyper-casual)
- `OnTap()`, `OnHoldStart()`, `OnHoldEnd()`, `OnSwipe(Vector2 delta)`.
- `IsHyperCasualValid()` returns true only if `requiresTwoFingers == false`.

**Negative-demo:** virtual joystick, multi-touch gestures.

**Grader (5):**
- `InputMode` enum with ≥3 values
- `requiresTwoFingers` bool field
- `IsHyperCasualValid` method exists
- Method body references `requiresTwoFingers` check
- Has at least 2 single-input handler methods (OnTap / OnSwipe / OnHold*)

### Task 18: `instant-restart-on-failure`

**Class:** `InstantRestart` (MonoBehaviour)

Concept: failed run = tap once to restart. Restart speed is the differentiator vs other genres. No loading screens, no menu screens for retry.

**Demo `InstantRestart.cs`:**
- `[SerializeField] float restartTransitionSeconds = 0.3f;` (≤0.5 for hyper-casual)
- `[SerializeField] bool showRetryButtonImmediately = true;`
- `OnPlayerDeath()` triggers transition; `Restart()` resets state instantly.
- `IsInstantRestart()` returns true if `restartTransitionSeconds <= 0.5f` AND `showRetryButtonImmediately`.

**Negative-demo:** death triggers menu screen, multi-step restart flow.

**Grader (5):**
- `restartTransitionSeconds` literal ≤ 0.5
- `showRetryButtonImmediately` defaults to true
- `OnPlayerDeath` method exists
- `Restart` method exists
- `IsInstantRestart` checks both conditions

### Task 19: `ad-placement-as-core-loop`

**Class:** `AdPlacement` (MonoBehaviour)

Concept: ads are core economics. Interstitial after every N runs; rewarded ads for double-coins / continue. Pacing IS gameplay design.

**Demo `AdPlacement.cs`:**
- `[SerializeField] int interstitialEveryNRuns = 3;`
- `[SerializeField] bool offerRewardedDoubleCoins = true;`
- `[SerializeField] bool offerRewardedContinue = true;`
- `[SerializeField] float minSecondsBetweenInterstitials = 60f;` (avoid spammy ads)
- `ShouldShowInterstitial(int runsSinceLast, float secondsSinceLast)` returns true only if BOTH thresholds met.

**Negative-demo:** ad after every run, no rewarded ads, no min-spacing.

**Grader (5):**
- `interstitialEveryNRuns` in [2, 10]
- `minSecondsBetweenInterstitials` in [30, 300]
- `offerRewardedDoubleCoins` AND `offerRewardedContinue` fields exist (both bool)
- `ShouldShowInterstitial(int, float)` exists
- Method body uses `&&` (both conditions required)

---

## Tasks 20-22: `game-design-casual-endless-runner` (3 guides)

### Task 20: `procedural-chunk-generation`

**Class:** `ChunkGenerator` (ScriptableObject, `[CreateAssetMenu]`)

Concept: pre-made chunks (10-20s each) shuffled per run. Each chunk is hand-tuned; randomization is at the chunk-sequence level, not individual obstacles.

**Demo `ChunkGenerator.cs`:**
- `LevelChunk` serializable: `chunkName (string)`, `chunkPrefab (GameObject)`, `difficultyTier (int)`, `secondsToTraverseAtBaseSpeed (float)`.
- `[SerializeField] LevelChunk[] chunkPool;`
- `[SerializeField] int chunksPerRun = 30;`
- `PickNextChunk(int currentDifficultyTier)` returns a chunk at the appropriate tier.

**Negative-demo:** fully procedural per-obstacle generation, no chunk pool.

**Grader (5):**
- ScriptableObject with `[CreateAssetMenu]`
- `LevelChunk` serializable inner class with the 4 fields
- `chunkPool` array field
- `chunksPerRun` > 0
- `PickNextChunk(int)` exists

### Task 21: `speed-obstacle-density-curve`

**Class:** `RunnerDifficulty` (MonoBehaviour)

Concept: base speed increases over time; obstacle density scales per second. Player can never plateau but never feels artificially forced to fail.

**Demo `RunnerDifficulty.cs`:**
- `[SerializeField] float baseSpeed = 8f;`
- `[SerializeField] float speedIncreasePerMinute = 1.5f;`
- `[SerializeField] AnimationCurve obstacleDensityOverTime;`
- `[SerializeField] float maxSpeed = 25f;` (hard cap)
- `SpeedAt(float elapsedSeconds)` returns `Mathf.Min(baseSpeed + (elapsedSeconds / 60f) * speedIncreasePerMinute, maxSpeed)`.
- `ObstacleDensityAt(float elapsedSeconds)` evaluates the AnimationCurve.

**Negative-demo:** constant speed, constant density.

**Grader (5):**
- `baseSpeed` > 0
- `speedIncreasePerMinute` > 0
- `maxSpeed > baseSpeed` (cap is meaningful)
- `SpeedAt` uses `Mathf.Min` for cap
- `ObstacleDensityAt` exists

### Task 22: `run-economy-meta-progression`

**Class:** `RunEconomy` (ScriptableObject, `[CreateAssetMenu]`)

Concept: coins per run unlock characters, boards, power-ups. Each run feels productive even on failure (cosmetics, character XP).

**Demo `RunEconomy.cs`:**
- `Unlockable` serializable: `name (string)`, `costCoins (int)`, `unlockType (UnlockType)`.
- `UnlockType` enum: Character, Board, PowerUp.
- `[SerializeField] Unlockable[] unlockables;`
- `[SerializeField] int baseCoinsPerSecond = 2;`
- `[SerializeField] float failureCoinKeepPercent = 0.5f;` (player keeps 50% on failure — no run is wasted)
- `CoinsEarned(float runSeconds, bool succeeded)` returns coins, possibly reduced if `!succeeded`.

**Negative-demo:** zero coins on failure, no unlockables system.

**Grader (5):**
- ScriptableObject with `[CreateAssetMenu]`
- `UnlockType` enum with ≥3 values
- `failureCoinKeepPercent` > 0 (player keeps SOMETHING on failure)
- `Unlockable` serializable inner class
- `CoinsEarned(float, bool)` exists, references `failureCoinKeepPercent` when `!succeeded`

---

## Task 23: Refresh corpus + CONTEXT.md + tag

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types scripts/build-guides.ts
node --experimental-strip-types skills-cli/build-dist.ts
cd ..
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
```
Expected: `All 72 graders calibrated.`

Smoke search across new categories:
```bash
node serving/build/ggdd.js search "match 3 game design"
node serving/build/ggdd.js search "Candy Crush special tiles"
node serving/build/ggdd.js search "merge mansion energy"
node serving/build/ggdd.js search "water sort puzzle"
node serving/build/ggdd.js search "Crowd City lane swipe"
node serving/build/ggdd.js search "idle clicker prestige"
node serving/build/ggdd.js search "hyper casual one tap"
node serving/build/ggdd.js search "Temple Run endless runner"
```

Each should return guides from the new casual-* category as top result.

Update `CONTEXT.md` (replace guides/ entry):

```
- `guides/` — guide content. 72 guides across 23 categories. v2 (Plans 7a-d) covered shooter/platformer/soulslike/AI-perception/strategy/Unity-engine; Plan 8 added 7 casual subgenres (match-3, merge-2, color-sort, lane-switch, clicker-idle, hyper-casual, endless-runner).
```

Commit + tag:
```bash
git add serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin CONTEXT.md
git commit -m "feat(serving): regenerate corpus from 72 guides (Plan 8 adds 21 casual genre guides)"
git tag v1.5.0-plan8
```

---

## Plan 8 acceptance

- [ ] `find guides -name guide.md | wc -l` → `72`
- [ ] `ggdd-dev dev-all --test-grader` → `All 72 graders calibrated.`
- [ ] Smoke search "match 3 game design" returns a `casual-match-3` guide as top result
- [ ] Tag `v1.5.0-plan8`
