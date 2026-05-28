# ggdd Plan 7c — Strategy (RTS-classic + MOBA + MMORTS, 9 new guides)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Add 3 strategy subgenres with 3 guides each = 9 new guides. Brings corpus from 39 → 48 guides. Schema already accepts these category names (Plan 7a Task 1).

**Tech Stack:** Same as Plan 7a/b. Use npm.

**Branch:** `feature/plan-7c-strategy` (off `main`, after PR #8).

---

## Per-task format

Each task creates 6 files in `guides/<category>/<id>/`: guide.md (frontmatter + Implementation/Avoid/Gotchas body), expectations.md (5-7 numbered), tasks/task.md, demo/<Class>.cs, negative-demo/<Class>.cs, grader.ts (5-7 assertions using `codeOnly` comment-stripped pattern from Plan 7a/b). Calibrate: demo passes, negative-demo fails ≥3. Commit per task with `feat(guides): add <id> guide + grader`.

All guides use `gradeMode: static`, `unityVersion: "6000.0"`, `baseApp: empty-unity6`.

---

## Task 1: `game-design-rts-classic/resource-economy-curves`

**Class:** `RtsEconomy` (MonoBehaviour)

Concept: 1-2 primary resources with caps; worker efficiency curves; expansion as economic gate. Tune via mining rate, worker count cap, expansion cost scaling.

**Demo `RtsEconomy.cs` fields/methods:**
- `[SerializeField] float mineralsPerWorkerPerSecond = 0.6f;`
- `[SerializeField] int workersCapPerExpansion = 16;`
- `[SerializeField] float expansionCostMineralsBase = 400f;`
- `[SerializeField] float expansionCostScaling = 1.5f;` (each additional expansion costs more)
- `EconomicCapacity(int expansionCount, int totalWorkers)` returns mineralsPerSecond.
- `ExpansionCost(int existingExpansions)` returns cost using exponential scaling.

**Negative-demo:** single hardcoded "10 minerals/sec" with no scaling, no caps.

**Grader assertions** (5-6):
- Serialized `mineralsPerWorkerPerSecond` in (0, 5)
- Serialized `workersCapPerExpansion` int > 0
- `expansionCostScaling` > 1.0 (must scale)
- `EconomicCapacity` method exists and takes (int, int)
- `ExpansionCost` method exists and uses Mathf.Pow (or *)

---

## Task 2: `game-design-rts-classic/unit-counter-triangles`

**Class:** `UnitCounters` (ScriptableObject, `[CreateAssetMenu]`)

Concept: rock-paper-scissors at army level. Each unit type has STRONG against / WEAK against relationships. Soft counters within tiers.

**Demo `UnitCounters.cs`:**
- `UnitType` enum: Infantry, Cavalry, Spear, Archer, Mage.
- `CounterRelation` serializable: `attacker (UnitType)`, `victim (UnitType)`, `damageMultiplier (float)`.
- `[SerializeField] CounterRelation[] relations;`
- `DamageMultiplier(UnitType atk, UnitType victim)` returns 1.0 default, looks up override.

**Negative-demo:** flat damage, no enum, no counter relationships.

**Grader assertions** (5):
- `UnitType` enum with ≥4 values
- `CounterRelation` serializable inner class with 3 fields
- `relations` array field
- `DamageMultiplier(UnitType, UnitType)` method
- Default fallback returns 1.0 (or has a default-return path)

---

## Task 3: `game-design-rts-classic/build-order-legibility`

**Class:** `BuildOrderScout` (MonoBehaviour)

Concept: opponent strategy should be identifiable within 30s via scouting. Buildings have visible silhouettes; tech-tree branches reveal intent.

**Demo `BuildOrderScout.cs`:**
- `[SerializeField] float scoutWindowSeconds = 30f;`
- `[SerializeField] float buildingVisibilityRadius = 200f;`
- `BuildingArchetype` enum: Economy, Tech, MilitaryRanged, MilitaryMelee, Defense.
- `IdentifyStrategy(BuildingArchetype[] scoutedBuildings)` returns dominant archetype (most-frequent).

**Negative-demo:** no scouting concept, no archetypes, just unit counts.

**Grader assertions** (5):
- `scoutWindowSeconds` serialized in [15, 60]
- `BuildingArchetype` enum ≥4 values
- `IdentifyStrategy` takes BuildingArchetype[]
- References `BuildingArchetype` enum (multiple usages)
- Has a method returning the dominant archetype

---

## Task 4: `game-design-moba/three-phase-game-arc`

**Class:** `MobaPhases` (ScriptableObject, `[CreateAssetMenu]`)

Concept: lane phase / mid game / late game arc. Champion power-spike timing differs to create variety.

**Demo `MobaPhases.cs`:**
- `GamePhase` enum: Lane, Mid, Late.
- `ChampionPowerCurve` serializable: `championName (string)`, `lanePower (float)`, `midPower (float)`, `latePower (float)`.
- `[SerializeField] ChampionPowerCurve[] champions;`
- `PowerInPhase(string championName, GamePhase phase)` returns 0..10 power rating.
- `PeakPhase(string championName)` returns the phase with highest power.

**Negative-demo:** flat power across phases, no champion variety.

**Grader assertions** (5):
- `GamePhase` enum with exactly 3 values
- `ChampionPowerCurve` serializable inner class
- `champions` array field
- `PowerInPhase` and `PeakPhase` methods exist
- Per-champion phases differ (uses 3 distinct phase fields in inner class)

---

## Task 5: `game-design-moba/role-counter-pick-draft`

**Class:** `DraftSystem` (MonoBehaviour)

Concept: champions in distinct roles (Tank/Assassin/Support/Marksman/Mage). Counter-pick phase enables strategic ban/pick.

**Demo `DraftSystem.cs`:**
- `Role` enum: Tank, Assassin, Support, Marksman, Mage.
- `[SerializeField] int banCount = 5;`
- `[SerializeField] int pickCount = 5;`
- `[SerializeField] bool pickAfterBan = true;` (ban first, then alternating picks)
- `IsValidDraft(Role[] picks)` returns true only if at least 3 distinct roles are represented (encourages comp variety).

**Negative-demo:** no Role enum, no ban/pick distinction.

**Grader assertions** (5):
- `Role` enum with ≥5 values
- Serialized `banCount` and `pickCount` ints > 0
- Serialized `pickAfterBan` bool
- `IsValidDraft(Role[])` method exists
- References `Role` enum in body

---

## Task 6: `game-design-moba/comeback-mechanics-without-invalidating-leads`

**Class:** `ComebackMechanic` (MonoBehaviour)

Concept: bounties, neutral objectives that scale with deficit. Tune so a 5k gold lead is meaningful but not insurmountable.

**Demo `ComebackMechanic.cs`:**
- `[SerializeField] float baseBountyGold = 300f;`
- `[SerializeField] float bountyScalingPerKgoldDeficit = 80f;`
- `[SerializeField] float maxBountyGold = 1200f;` (cap)
- `[SerializeField] float neutralObjectiveBoostMaxPercent = 0.30f;` (max 30% boost)
- `BountyForKill(float losingTeamGold, float winningTeamGold)` returns gold (capped).

**Negative-demo:** fixed bounty regardless of deficit.

**Grader assertions** (5):
- 4 serialized scaling fields
- `maxBountyGold` > `baseBountyGold` (cap is meaningful)
- `neutralObjectiveBoostMaxPercent` in (0, 0.5]
- `BountyForKill` takes (float, float) and uses Mathf.Min for cap
- References scaling field in body

---

## Task 7: `game-design-mmorts/off-peak-persistence-with-build-queues`

**Class:** `BuildQueue` (MonoBehaviour)

Concept: game progresses while offline (build queues), rewards but doesn't require frequent check-ins.

**Demo `BuildQueue.cs`:**
- `BuildOrder` serializable: `buildingType (string)`, `secondsToComplete (float)`, `queuedAtRealTime (float)`.
- `[SerializeField] BuildOrder[] queue;`
- `[SerializeField] int maxQueueSlots = 3;` (per-village/base)
- `[SerializeField] float offlineProgressMultiplier = 1.0f;` (1.0 = full offline progress)
- `CompletedBuildings(float currentRealTime)` returns int (how many queue entries completed).

**Negative-demo:** no queue, instant build only.

**Grader assertions** (5):
- `BuildOrder` serializable inner class with 3 fields
- `maxQueueSlots` > 0
- `offlineProgressMultiplier` > 0
- `CompletedBuildings(float)` method
- References `Time.realtimeSinceStartup` or similar real-time concept (or accepts time as param)

---

## Task 8: `game-design-mmorts/resource-generation-over-real-time`

**Class:** `ResourceGenerator` (MonoBehaviour)

Concept: resources generated at X/hour while offline; storage caps prevent infinite accumulation.

**Demo `ResourceGenerator.cs`:**
- `[SerializeField] float woodPerHour = 100f;`
- `[SerializeField] float ironPerHour = 80f;`
- `[SerializeField] float foodPerHour = 120f;`
- `[SerializeField] int storageCap = 5000;`
- `AccumulatedSince(float resourcePerHour, float hoursElapsed)` returns Mathf.Min(perHour * hoursElapsed, storageCap).

**Negative-demo:** uncapped resource accumulation; resources only generated when player online.

**Grader assertions** (5):
- 3 serialized per-resource fields
- `storageCap` int > 0
- `AccumulatedSince` method takes (float, float) and uses Mathf.Min with storageCap
- Resource rates > 0
- Does NOT use `Update()` for resource generation (that would only work when player is online)

---

## Task 9: `game-design-mmorts/coalition-clan-endgame`

**Class:** `ClanSystem` (ScriptableObject, `[CreateAssetMenu]`)

Concept: solo progression caps out; deep gameplay requires guild participation, joint attacks, shared resources.

**Demo `ClanSystem.cs`:**
- `[SerializeField] int soloProgressionCap = 50;` (max level for solo players)
- `[SerializeField] int clanMaxLevel = 100;` (only reachable with clan)
- `ClanBonus` serializable: `clanSize (int)`, `bonusMultiplier (float)`.
- `[SerializeField] ClanBonus[] bonuses;` (e.g., size 5 = 1.1×, size 10 = 1.25×)
- `MaxAchievableLevel(bool inClan)` returns soloCap if not, clanMax if in clan.

**Negative-demo:** no clan concept, solo == max.

**Grader assertions** (5):
- ScriptableObject with `[CreateAssetMenu]`
- `soloProgressionCap` < `clanMaxLevel` (clan is meaningfully better)
- `ClanBonus` serializable inner class
- `bonuses` array field
- `MaxAchievableLevel(bool)` method

---

## Task 10: Refresh corpus + CONTEXT.md + tag

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types scripts/build-guides.ts
node --experimental-strip-types skills-cli/build-dist.ts
cd ..
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
```
Expected: `All 48 graders calibrated.`

Update `CONTEXT.md` (replace the guides/ entry):

```
- `guides/` — guide content. 48 guides across 16 categories. Plan 7d (Unity engine: cinemachine, UI Toolkit, Netcode) will add 3 more guides as the final v2 addition.
```

```bash
git add serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin CONTEXT.md
git commit -m "feat(serving): regenerate corpus from 48 guides (Plan 7c adds 9 strategy guides)"
git tag v1.3.0-plan7c
```

---

## Plan 7c acceptance

- [ ] `find guides -name guide.md | wc -l` → `48`
- [ ] `ggdd-dev dev-all --test-grader` → `All 48 graders calibrated.`
- [ ] Tag `v1.3.0-plan7c`
