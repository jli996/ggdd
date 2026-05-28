# ggdd Plan 7a — Shooter Subgenres (12 new guides)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add 4 new shooter subgenres to ggdd's coverage (`game-design-shooter-survival`, `-extraction`, `-competitive`, `-singleplayer`) with 3 design guides each = 12 new guides. Also lay schema groundwork (in the frontmatter category enum) for the 8 future categories Plans 7b/7c/7d will add.

**Architecture:** Same per-guide structure Plan 2 established — `guide.md` + `expectations.md` + `tasks/task.md` + `demo/<File>.cs` + `negative-demo/<File>.cs` + `grader.ts`. All graders are `gradeMode: static`. Shooter guides target `baseApp: empty-unity6` (Plan 4 base-app) since no shooter-specific skeleton exists yet (tracked as a follow-up). Task 1 extends `lib/guide-validation.ts`'s category enum to accept ALL 12 new categories (4 from 7a + 3 platformer + 3 strategy + 1 soulslike + 1 AI), so Plans 7b/7c don't need to revisit the schema.

**Tech Stack:** Same as Plan 2 — `node:test` graders using `guides/test-fixture.ts`, static C# pattern matching, no Unity batch invocation. Use npm.

**Branch:** `feature/plan-7a-shooter-subgenres` (off `main`, after Plan 6 + threshold fix at `3d581b4`).

---

## File map

```
/Users/lijinglue/repo/ggdd/
├── lib/guide-validation.ts                                       # MODIFY (extend category enum)
├── lib/guide-validation.test.ts                                  # MODIFY (test new enum values)
├── guides/
│   ├── game-design-shooter-survival/                             # NEW (3 guides)
│   │   ├── persistent-world-session-join/
│   │   ├── full-loot-economy-with-friction/
│   │   └── geared-vs-naked-encounter-balance/
│   ├── game-design-shooter-extraction/                           # NEW (3 guides)
│   │   ├── raid-extract-loop-with-risk-gradient/
│   │   ├── loot-value-tiers-with-snowball-caps/
│   │   └── asymmetric-session-length-design/
│   ├── game-design-shooter-competitive/                          # NEW (3 guides)
│   │   ├── round-based-economy-reset/
│   │   ├── role-utility-orthogonality/
│   │   └── esports-readable-visual-design/
│   └── game-design-shooter-singleplayer/                         # NEW (3 guides)
│       ├── combat-puzzle-pacing/
│       ├── weapon-pickup-as-narrative-beat/
│       └── set-piece-cadence/
├── serving/lib/use-cases.gen.ts                                  # REGEN
├── serving/lib/embeddings.gen.bin                                # REGEN
└── CONTEXT.md                                                    # MODIFY
```

Each new guide directory has 6 files: `guide.md`, `expectations.md`, `tasks/task.md`, `demo/<File>.cs`, `negative-demo/<File>.cs`, `grader.ts`.

---

## Task 1: Extend the category enum

**Files:**
- Modify: `lib/guide-validation.ts`
- Modify: `lib/guide-validation.test.ts`

Add all 12 new categories (4 from 7a + 8 forward-looking for 7b/c/d) to the zod enum so Plans 7b–d don't need schema changes.

- [ ] **Step 1: Update the schema**

In `lib/guide-validation.ts`, change the `category` enum:

```typescript
  category: z.enum([
    'unity-engine',
    'unity-performance',
    'game-design-action',
    'game-design-deckbuilder',
    // v2 (Plan 7a — shooter subgenres)
    'game-design-shooter-survival',
    'game-design-shooter-extraction',
    'game-design-shooter-competitive',
    'game-design-shooter-singleplayer',
    // v2 (Plan 7b — platformer + soulslike + AI)
    'game-design-platformer-precision',
    'game-design-platformer-momentum',
    'game-design-platformer-3d-collectathon',
    'game-design-soulslike',
    'game-design-ai-perception',
    // v2 (Plan 7c — strategy)
    'game-design-rts-classic',
    'game-design-moba',
    'game-design-mmorts',
  ]),
```

- [ ] **Step 2: Add a test that exercises a new category**

Append to `lib/guide-validation.test.ts`:

```typescript
test('validateFrontmatter accepts the new v2 categories', () => {
  for (const cat of [
    'game-design-shooter-survival',
    'game-design-shooter-extraction',
    'game-design-shooter-competitive',
    'game-design-shooter-singleplayer',
    'game-design-platformer-precision',
    'game-design-platformer-momentum',
    'game-design-platformer-3d-collectathon',
    'game-design-soulslike',
    'game-design-ai-perception',
    'game-design-rts-classic',
    'game-design-moba',
    'game-design-mmorts',
  ] as const) {
    const valid = validateFrontmatter({
      id: 'x', category: cat, title: 'T', description: 'D', useCases: ['u'],
      gradeMode: 'static', unityVersion: '6000.0', baseApp: 'empty-unity6',
    });
    assert.equal(valid.category, cat);
  }
});
```

- [ ] **Step 3: Verify**

```bash
node --experimental-strip-types --test lib/guide-validation.test.ts
```
Expected: all tests pass (6 existing + 1 new).

- [ ] **Step 4: Commit**

```bash
git add lib/guide-validation.ts lib/guide-validation.test.ts
git commit -m "feat(lib): extend guide-validation category enum for v2 (Plan 7a-d)"
```

---

## Task 2: `persistent-world-session-join` (shooter-survival)

**Files:** `guides/game-design-shooter-survival/persistent-world-session-join/{guide.md, expectations.md, tasks/task.md, demo/SessionGuard.cs, negative-demo/SessionGuard.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: persistent-world-session-join
category: game-design-shooter-survival
title: Persistent-world session join (log-off timer + relog cooldown)
description: Handle player logout/login in a continuously-running survival shooter world without enabling combat-logging exploits or punishing legitimate disconnects.
useCases:
  - "prevent combat logging in survival shooter"
  - "design relog cooldown in MMO survival"
  - "log-off timer for persistent world"
  - "handle player disconnect during PvP"
  - "DayZ-style session join"
relatedGuides: []
appliesTo:
  - "any survival shooter with a persistent server and player-vs-player risk"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Persistent-world session join

In a persistent-world survival shooter (DayZ, Rust, ARK), players can connect and disconnect mid-encounter. Without design intervention, this enables **combat logging**: a player about to die quits the game, their character vanishes, no death, no loot dropped.

The standard fix is a two-part timer:
1. **Log-off timer**: when the player initiates logout, their character stays in-world (visible, killable) for N seconds before despawning.
2. **Relog cooldown**: a player who disconnected in a hot zone can't immediately rejoin from a safe location.

## Implementation

```csharp
using UnityEngine;

public class SessionGuard : MonoBehaviour
{
    [SerializeField] private float logOffSeconds = 30f;
    [SerializeField] private float relogCooldownSeconds = 60f;
    private float logOffStartedAt = -1f;
    private float lastDisconnectAt = -1f;

    public bool IsLoggingOff => logOffStartedAt >= 0f;

    public void RequestLogOff()
    {
        // Character remains in-world for `logOffSeconds`.
        logOffStartedAt = Time.time;
    }

    public bool CanCompleteLogOff()
    {
        return IsLoggingOff && Time.time - logOffStartedAt >= logOffSeconds;
    }

    public void OnDisconnect()
    {
        lastDisconnectAt = Time.time;
    }

    public bool CanRejoin()
    {
        if (lastDisconnectAt < 0f) return true;
        return Time.time - lastDisconnectAt >= relogCooldownSeconds;
    }
}
```

## Avoid

- Instantly despawning a character on logout/disconnect — that's the combat-logging exploit.
- Zero relog cooldown — lets a dying player reconnect repeatedly from a safe spawn.
- Coupling logout flow to network state only — a player who pulls their network cable is the same threat as one who clicks "Quit."

## Gotchas

- The log-off window should be visible to nearby players ("Logging out in 30s…") so they have agency over whether to engage.
- Internet drops != combat-log intent — but the system can't tell the difference, so treat both the same and tune the cooldown to be friction, not punishment.
- Servers should persist `lastDisconnectAt` across restarts; otherwise a server crash resets every player's cooldown.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: persistent-world-session-join

After applying this guide, the agent's `Assets/Scripts/SessionGuard.cs` should:

1. Have a serialized `logOffSeconds` (or similar) field with a value between 10 and 120.
2. Have a serialized `relogCooldownSeconds` (or similar) field with a value between 30 and 600.
3. Expose `RequestLogOff()` and `CanCompleteLogOff()` methods (or equivalent gating).
4. Expose `OnDisconnect()` and `CanRejoin()` methods (or equivalent gating).
5. Use `Time.time` to measure elapsed windows (not a coroutine — must compose with reconnects).
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/SessionGuard.cs` to gate logout + relog in a persistent-world survival shooter. Provide:
- `RequestLogOff()` that starts a log-off window (default 30s).
- `CanCompleteLogOff()` returning true only after the window elapses.
- `OnDisconnect()` that records a disconnect timestamp.
- `CanRejoin()` returning true only after the relog cooldown (default 60s) elapses.

Use `Time.time` (NOT a coroutine — the system must survive server-side restarts via persisted timestamps).
```

- [ ] **Step 4: `demo/SessionGuard.cs`**

```csharp
using UnityEngine;

public class SessionGuard : MonoBehaviour
{
    [SerializeField] private float logOffSeconds = 30f;
    [SerializeField] private float relogCooldownSeconds = 60f;
    private float logOffStartedAt = -1f;
    private float lastDisconnectAt = -1f;

    public bool IsLoggingOff => logOffStartedAt >= 0f;

    public void RequestLogOff()
    {
        logOffStartedAt = Time.time;
    }

    public bool CanCompleteLogOff()
    {
        return IsLoggingOff && Time.time - logOffStartedAt >= logOffSeconds;
    }

    public void OnDisconnect()
    {
        lastDisconnectAt = Time.time;
    }

    public bool CanRejoin()
    {
        if (lastDisconnectAt < 0f) return true;
        return Time.time - lastDisconnectAt >= relogCooldownSeconds;
    }
}
```

- [ ] **Step 5: `negative-demo/SessionGuard.cs`**

```csharp
using UnityEngine;

public class SessionGuard : MonoBehaviour
{
    // No timers. Logout despawns immediately; relog allowed instantly.
    public void RequestLogOff()
    {
        Destroy(gameObject);
    }
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'SessionGuard.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares a serialized log-off-window field with a value in [10, 120]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[lL]og\w*\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected a [SerializeField] float for the log-off window');
  const v = parseFloat(m![1]);
  assert.ok(v >= 10 && v <= 120, `log-off window default ${v} not in [10, 120]`);
});

test('declares a serialized relog-cooldown field with a value in [30, 600]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[rR]elog\w*\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected a [SerializeField] float for the relog cooldown');
  const v = parseFloat(m![1]);
  assert.ok(v >= 30 && v <= 600, `relog cooldown default ${v} not in [30, 600]`);
});

test('exposes RequestLogOff and CanCompleteLogOff', () => {
  assert.ok(hasPattern(codeOnly, /\bRequestLogOff\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bCanCompleteLogOff\s*\(/));
});

test('exposes OnDisconnect and CanRejoin', () => {
  assert.ok(hasPattern(codeOnly, /\bOnDisconnect\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bCanRejoin\s*\(/));
});

test('uses Time.time (not coroutines) for the windows', () => {
  assert.ok(hasPattern(codeOnly, /\bTime\.time\b/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-survival/persistent-world-session-join/grader.ts
TARGET_FILE=$(pwd)/guides/game-design-shooter-survival/persistent-world-session-join/negative-demo/SessionGuard.cs \
  node --experimental-strip-types --test guides/game-design-shooter-survival/persistent-world-session-join/grader.ts
```
Expected: demo 5/5; negative-demo fails ≥4 (no fields, no methods, no Time.time).

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-survival/persistent-world-session-join/
git commit -m "feat(guides): add persistent-world-session-join guide + grader"
```

---

## Task 3: `full-loot-economy-with-friction` (shooter-survival)

**Files:** `guides/game-design-shooter-survival/full-loot-economy-with-friction/{guide.md, expectations.md, tasks/task.md, demo/LootDecay.cs, negative-demo/LootDecay.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: full-loot-economy-with-friction
category: game-design-shooter-survival
title: Full-loot economy with friction (decay, raid windows, vault caps)
description: In a full-loot survival shooter, death drops everything — but the meta-economy needs friction (item decay, base-raid windows, vault size caps) to prevent runaway accumulation by top players.
useCases:
  - "design loot economy in survival shooter"
  - "prevent gear hoarding in PvP survival"
  - "Rust base raid window design"
  - "item degradation and decay timer"
  - "vault cap and storage friction"
relatedGuides:
  - persistent-world-session-join
appliesTo:
  - "any survival shooter where death drops loot AND players persist gear between sessions"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Full-loot economy with friction

A full-loot survival shooter's primary engagement loop is "gear up → risk gear → die or extract." But without friction, top players hoard gear faster than they can lose it, and new players face a permanent disadvantage.

Three friction mechanisms keep the economy churning:
1. **Item degradation**: gear loses durability with use, eventually breaks
2. **Base raid windows**: stored loot is vulnerable for a few hours per day
3. **Vault size caps**: storage is finite; surplus has to leave the economy somehow

## Implementation pattern

```csharp
using UnityEngine;

public class LootDecay : MonoBehaviour
{
    [SerializeField] private float decayPerUse = 0.02f;
    [SerializeField] private int vaultMaxItems = 32;
    [SerializeField] private float raidWindowStartHour = 18f;
    [SerializeField] private float raidWindowDurationHours = 4f;

    public float ApplyDurabilityLoss(float currentDurability)
    {
        return Mathf.Max(0f, currentDurability - decayPerUse);
    }

    public bool CanAddToVault(int currentVaultCount)
    {
        return currentVaultCount < vaultMaxItems;
    }

    public bool IsRaidWindowOpen(float serverHour)
    {
        return serverHour >= raidWindowStartHour
            && serverHour < raidWindowStartHour + raidWindowDurationHours;
    }
}
```

## Avoid

- Indestructible gear in a full-loot game — top players accumulate forever; the economy becomes one-way.
- 24/7 raid windows — players can never log off; turns the game into a job.
- Unlimited vaults — same issue as indestructible gear; the surplus has nowhere to go.
- Decay so steep that gear breaks before the player can use it meaningfully — kills the gear-acquisition reward loop.

## Gotchas

- Raid windows should be telegraphed (in-game clock, server message) so defenders can plan.
- Item categories may decay at different rates (e.g., weapons faster than backpacks). Tune per-category, not global.
- Vault caps interact with player count — solo cap of 32 may be fine, but a 5-person clan needs 5× storage. Tier vault size by group size.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: full-loot-economy-with-friction

After applying this guide, the agent's `Assets/Scripts/LootDecay.cs` should:

1. Have a `decayPerUse` (or similar) serialized field with value in (0, 0.5].
2. Have a `vaultMaxItems` (or similar) serialized integer field with value > 0.
3. Have a `raidWindowStartHour` and `raidWindowDurationHours` (or similar) fields.
4. Expose `ApplyDurabilityLoss(float)` returning a clamped non-negative value.
5. Expose `CanAddToVault(int)` returning false when at cap.
6. Expose `IsRaidWindowOpen(float)` honoring the configured window.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/LootDecay.cs` for a full-loot survival shooter. Provide:
- Item decay: `ApplyDurabilityLoss(float current)` returns `current - decayPerUse`, clamped to ≥0.
- Vault cap: `CanAddToVault(int current)` returns true only if `current < vaultMaxItems`.
- Raid window: `IsRaidWindowOpen(float serverHour)` returns true only during the configured window.

Use serialized fields for `decayPerUse`, `vaultMaxItems`, `raidWindowStartHour`, `raidWindowDurationHours` so designers can tune without recompiling.
```

- [ ] **Step 4: `demo/LootDecay.cs`**

```csharp
using UnityEngine;

public class LootDecay : MonoBehaviour
{
    [SerializeField] private float decayPerUse = 0.02f;
    [SerializeField] private int vaultMaxItems = 32;
    [SerializeField] private float raidWindowStartHour = 18f;
    [SerializeField] private float raidWindowDurationHours = 4f;

    public float ApplyDurabilityLoss(float currentDurability)
    {
        return Mathf.Max(0f, currentDurability - decayPerUse);
    }

    public bool CanAddToVault(int currentVaultCount)
    {
        return currentVaultCount < vaultMaxItems;
    }

    public bool IsRaidWindowOpen(float serverHour)
    {
        return serverHour >= raidWindowStartHour
            && serverHour < raidWindowStartHour + raidWindowDurationHours;
    }
}
```

- [ ] **Step 5: `negative-demo/LootDecay.cs`**

```csharp
using UnityEngine;

public class LootDecay : MonoBehaviour
{
    // Indestructible gear, unlimited vault, no raid window.
    public bool CanAddToVault(int currentVaultCount) => true;
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LootDecay.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares a decayPerUse serialized field in (0, 0.5]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*decay\w*\s*=\s*(\d+(?:\.\d+)?)f?/i);
  assert.ok(m, 'expected a [SerializeField] float for decay');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 0.5, `decay default ${v} not in (0, 0.5]`);
});

test('declares a vault cap serialized int', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+\w*[Vv]ault\w*/));
});

test('declares raid window fields', () => {
  assert.ok(hasPattern(codeOnly, /\braidWindow\w*\b/i));
});

test('ApplyDurabilityLoss exists and clamps to >= 0', () => {
  assert.ok(hasPattern(codeOnly, /\bApplyDurabilityLoss\s*\(/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Max\s*\(\s*0f?\s*,/));
});

test('CanAddToVault exists', () => {
  assert.ok(hasPattern(codeOnly, /\bCanAddToVault\s*\(/));
});

test('IsRaidWindowOpen exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsRaidWindowOpen\s*\(/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-survival/full-loot-economy-with-friction/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-survival/full-loot-economy-with-friction/negative-demo/LootDecay.cs \
  node --experimental-strip-types --test guides/game-design-shooter-survival/full-loot-economy-with-friction/grader.ts 2>&1 | tail -5
```
Expected: demo 6/6; negative-demo fails ≥4.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-survival/full-loot-economy-with-friction/
git commit -m "feat(guides): add full-loot-economy-with-friction guide + grader"
```

---

## Task 4: `geared-vs-naked-encounter-balance` (shooter-survival)

**Files:** `guides/game-design-shooter-survival/geared-vs-naked-encounter-balance/{guide.md, expectations.md, tasks/task.md, demo/EncounterBalance.cs, negative-demo/EncounterBalance.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: geared-vs-naked-encounter-balance
category: game-design-shooter-survival
title: Geared vs naked encounter balance (mitigate first-blood snowball)
description: In a survival shooter, a fully-geared player wiping a fresh spawn isn't fun for either side. Use damage-cap, geographic zoning, or risk-reward bias so geared players have incentive NOT to grief fresh spawns.
useCases:
  - "balance fresh spawn vs geared player in survival shooter"
  - "prevent griefing of new players"
  - "DayZ coastal player problem"
  - "loot value gating by zone"
  - "geographic gear tier zoning"
relatedGuides:
  - full-loot-economy-with-friction
appliesTo:
  - "any persistent-world shooter where gear disparity between players is large"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Geared vs naked encounter balance

A survival shooter's freshest spawns (naked, no weapons) and its top players (fully-geared) coexist on the same map. Without design intervention, a fully-geared player wandering through a fresh-spawn zone can wipe everyone for sport — fun for nobody, retention killer for newcomers.

Three mitigations (used together, not alone):

1. **Geographic zoning**: split the map into tiers. Low-tier zones have low-value loot — so geared players have no reason to hunt fresh spawns there. High-tier zones are dangerous and high-reward.
2. **Loot value bias toward risk**: best loot only spawns in highest-risk zones. Geared players go where the loot is, away from fresh spawns.
3. **Damage soft-cap on naked targets**: a top-tier weapon does the same damage to a naked target as a mid-tier weapon. Removes the "fun" of one-shot grief kills.

## Implementation

```csharp
using UnityEngine;

public enum ZoneTier { Coastal, MidInland, HighRisk }

public class EncounterBalance : MonoBehaviour
{
    [SerializeField] private float nakedDamageSoftCap = 30f;
    [SerializeField] private ZoneTier currentZone = ZoneTier.Coastal;

    public float ScaleDamageToTarget(float baseDamage, bool targetIsNaked)
    {
        if (targetIsNaked) return Mathf.Min(baseDamage, nakedDamageSoftCap);
        return baseDamage;
    }

    public float ZoneLootMultiplier()
    {
        return currentZone switch
        {
            ZoneTier.Coastal => 0.3f,
            ZoneTier.MidInland => 1.0f,
            ZoneTier.HighRisk => 2.5f,
            _ => 1.0f,
        };
    }
}
```

## Avoid

- Uniform loot distribution — geared players have no reason to leave the safe-loot zones, so they grief.
- No damage cap — a fresh spawn dies in one hit from any geared weapon.
- A "safe zone" with no PvP — turns into permanent griefer-staging; players AFK there. Tier the risk, don't remove it.

## Gotchas

- "Naked" detection should be lenient (any decent armor disqualifies); otherwise players exploit by stripping just before combat to invoke the soft-cap on themselves.
- Tier zones must be telegraphed clearly (map markers, UI, environmental cues) so players choose risk knowingly.
- Mid-tier zones are the most contested — design accordingly.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: geared-vs-naked-encounter-balance

After applying this guide, the agent's `Assets/Scripts/EncounterBalance.cs` should:

1. Declare a `ZoneTier` enum with at least three distinct values (e.g. Coastal, MidInland, HighRisk).
2. Have a `nakedDamageSoftCap` (or similar) serialized float.
3. Expose `ScaleDamageToTarget(float, bool)` that returns the soft-capped damage when the target is naked.
4. Expose `ZoneLootMultiplier()` that returns DIFFERENT values per zone (not a constant).
5. The coastal/low-tier zone should have a smaller multiplier than the high-risk zone.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/EncounterBalance.cs`. Provide:
- A `ZoneTier` enum (Coastal, MidInland, HighRisk).
- `ScaleDamageToTarget(float baseDamage, bool targetIsNaked)` that caps damage at `nakedDamageSoftCap` when the target is naked.
- `ZoneLootMultiplier()` that returns a per-zone float — high-risk zones should multiply loot more than coastal zones (so geared players have incentive to travel inland, away from fresh spawns).
```

- [ ] **Step 4: `demo/EncounterBalance.cs`**

```csharp
using UnityEngine;

public enum ZoneTier { Coastal, MidInland, HighRisk }

public class EncounterBalance : MonoBehaviour
{
    [SerializeField] private float nakedDamageSoftCap = 30f;
    [SerializeField] private ZoneTier currentZone = ZoneTier.Coastal;

    public float ScaleDamageToTarget(float baseDamage, bool targetIsNaked)
    {
        if (targetIsNaked) return Mathf.Min(baseDamage, nakedDamageSoftCap);
        return baseDamage;
    }

    public float ZoneLootMultiplier()
    {
        return currentZone switch
        {
            ZoneTier.Coastal => 0.3f,
            ZoneTier.MidInland => 1.0f,
            ZoneTier.HighRisk => 2.5f,
            _ => 1.0f,
        };
    }
}
```

- [ ] **Step 5: `negative-demo/EncounterBalance.cs`**

```csharp
using UnityEngine;

public class EncounterBalance : MonoBehaviour
{
    public float ScaleDamageToTarget(float baseDamage, bool targetIsNaked) => baseDamage;
    public float ZoneLootMultiplier() => 1.0f;
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EncounterBalance.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares a ZoneTier enum', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'ZoneTier'));
});

test('enum has at least 3 distinct values', () => {
  const m = codeOnly.match(/enum\s+ZoneTier\s*\{([^}]+)\}/);
  assert.ok(m, 'ZoneTier enum body not found');
  const values = m![1].split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 3, `expected ≥3 zone tiers, got ${values.length}: ${values.join(', ')}`);
});

test('has a nakedDamageSoftCap serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+\w*naked\w*[Cc]ap/i));
});

test('ScaleDamageToTarget uses Mathf.Min (or equivalent clamp)', () => {
  assert.ok(hasPattern(codeOnly, /\bScaleDamageToTarget\s*\(/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Min\s*\(/) || hasPattern(codeOnly, /\?\s*Mathf\.Min/));
});

test('ZoneLootMultiplier returns different values per zone (uses switch or if chain)', () => {
  assert.ok(hasPattern(codeOnly, /\bZoneLootMultiplier\s*\(/));
  // Must reference at least 2 distinct enum values.
  const refs = codeOnly.match(/ZoneTier\.\w+/g) ?? [];
  const distinct = new Set(refs);
  assert.ok(distinct.size >= 2, `expected ≥2 distinct zone refs in multiplier, found ${distinct.size}`);
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-survival/geared-vs-naked-encounter-balance/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-survival/geared-vs-naked-encounter-balance/negative-demo/EncounterBalance.cs \
  node --experimental-strip-types --test guides/game-design-shooter-survival/geared-vs-naked-encounter-balance/grader.ts 2>&1 | tail -5
```
Expected: demo 5/5; negative-demo fails ≥3.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-survival/geared-vs-naked-encounter-balance/
git commit -m "feat(guides): add geared-vs-naked-encounter-balance guide + grader"
```

---

## Task 5: `raid-extract-loop-with-risk-gradient` (shooter-extraction)

**Files:** `guides/game-design-shooter-extraction/raid-extract-loop-with-risk-gradient/{guide.md, expectations.md, tasks/task.md, demo/ExtractionZone.cs, negative-demo/ExtractionZone.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: raid-extract-loop-with-risk-gradient
category: game-design-shooter-extraction
title: Raid + extract loop with risk gradient
description: In an extraction shooter, the extraction itself IS the gameplay climax. Telegraph zones, contest them with timing, and weight reward by distance/risk so extraction is a meaningful decision, not a formality.
useCases:
  - "design extraction zones in extraction shooter"
  - "Tarkov style extract design"
  - "Hunt: Showdown extraction gameplay"
  - "risk gradient for raid extraction"
  - "contested extract spawn timing"
relatedGuides: []
appliesTo:
  - "any extraction shooter where players raid, fight, and choose when/where to leave"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Raid + extract loop with risk gradient

The extraction is the gameplay climax in extraction shooters. The decision tree at extract — *Which zone? Now or wait? Risk a fight or detour?* — is the most important decision the player makes in the raid.

Design principles:
1. **Multiple zones, distinct risk/reward**: close-to-spawn extracts are safe but slow to reach; deep extracts are dangerous but pay better (XP/loot multiplier).
2. **Telegraph + delay**: zones broadcast their open status (radio chatter, smoke flare). The opening window is finite so players race to it.
3. **Contested by design**: zones should cluster naturally with other extracts or with PvE objectives, so the same area is approached by multiple players.

## Implementation

```csharp
using UnityEngine;

public class ExtractionZone : MonoBehaviour
{
    [SerializeField] private float openWindowSeconds = 90f;
    [SerializeField] private float distanceFromSpawn = 500f;
    [SerializeField] private float lootRewardMultiplier = 1f;
    private float windowStartedAt = -1f;

    public bool IsOpen => windowStartedAt >= 0f && Time.time - windowStartedAt < openWindowSeconds;

    public void Open()
    {
        windowStartedAt = Time.time;
        // Telegraph: trigger smoke flare, radio chatter, etc.
    }

    /// Reward scales with distance from spawn (geographic risk).
    public float RewardForExtract(float baseLoot)
    {
        float distanceBias = Mathf.Clamp01(distanceFromSpawn / 1000f);
        return baseLoot * (lootRewardMultiplier + distanceBias);
    }
}
```

## Avoid

- Single extract zone — turns into a deathmatch funnel; no decision-making.
- All zones with equal reward — players take the easiest, the rest are wasted content.
- Always-open zones — destroys the "race against the timer" tension.
- Silent zones (no telegraph) — players can't plan; the system devolves into camping.

## Gotchas

- The extract zone's open window should be short enough to feel urgent (60-120s typically) but long enough that a player far from the zone can sprint there if they commit immediately.
- Loot multiplier should reward distance but not so harshly that the closest extract is never worth it for low-loot raids.
- Sound design IS gameplay: the extract telegraph should be audible from a meaningful range (sound cone, not just visual).
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: raid-extract-loop-with-risk-gradient

After applying this guide, the agent's `Assets/Scripts/ExtractionZone.cs` should:

1. Have an `openWindowSeconds` serialized field with value between 30 and 300.
2. Have a `distanceFromSpawn` (or similar) serialized field.
3. Have a `lootRewardMultiplier` (or similar) serialized field.
4. Expose `IsOpen` (property or method) that returns true only while the window is active.
5. Expose `Open()` that starts the window.
6. Expose `RewardForExtract(float)` that returns a value INCREASING with `distanceFromSpawn`.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/ExtractionZone.cs` for an extraction shooter. Provide:
- A timed `openWindowSeconds` window (default ~90s).
- `Open()` to start the window.
- `IsOpen` returning true only during the window.
- `RewardForExtract(float baseLoot)` returning a value scaled by `distanceFromSpawn` (farther = more loot).

Use `Time.time` for the window. Tune `openWindowSeconds` between 30 and 300 seconds.
```

- [ ] **Step 4: `demo/ExtractionZone.cs`**

```csharp
using UnityEngine;

public class ExtractionZone : MonoBehaviour
{
    [SerializeField] private float openWindowSeconds = 90f;
    [SerializeField] private float distanceFromSpawn = 500f;
    [SerializeField] private float lootRewardMultiplier = 1f;
    private float windowStartedAt = -1f;

    public bool IsOpen => windowStartedAt >= 0f && Time.time - windowStartedAt < openWindowSeconds;

    public void Open()
    {
        windowStartedAt = Time.time;
    }

    public float RewardForExtract(float baseLoot)
    {
        float distanceBias = Mathf.Clamp01(distanceFromSpawn / 1000f);
        return baseLoot * (lootRewardMultiplier + distanceBias);
    }
}
```

- [ ] **Step 5: `negative-demo/ExtractionZone.cs`**

```csharp
using UnityEngine;

public class ExtractionZone : MonoBehaviour
{
    // Always open. Flat reward. No risk gradient.
    public bool IsOpen => true;
    public float RewardForExtract(float baseLoot) => baseLoot;
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'ExtractionZone.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares openWindowSeconds in [30, 300]', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[oO]penWindow\w*\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected [SerializeField] float for openWindowSeconds');
  const v = parseFloat(m![1]);
  assert.ok(v >= 30 && v <= 300, `openWindowSeconds default ${v} not in [30, 300]`);
});

test('declares distanceFromSpawn serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+\w*[dD]istance\w*/));
});

test('declares lootRewardMultiplier serialized field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?float\s+\w*[Ll]oot\w*[Mm]ult/));
});

test('IsOpen property or method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsOpen\b/));
});

test('Open() method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bvoid\s+Open\s*\(/));
});

test('RewardForExtract scales by distance (refers to distance field)', () => {
  const r = codeOnly.match(/RewardForExtract\s*\([^)]*\)[\s\S]*?\}\s*$/m);
  if (r) {
    assert.ok(/distance/i.test(r[0]), 'RewardForExtract body should reference a distance field');
  } else {
    // Expression body version.
    assert.ok(hasPattern(codeOnly, /RewardForExtract\s*\([^)]*\)\s*=>[^;]*distance/i));
  }
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-extraction/raid-extract-loop-with-risk-gradient/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-extraction/raid-extract-loop-with-risk-gradient/negative-demo/ExtractionZone.cs \
  node --experimental-strip-types --test guides/game-design-shooter-extraction/raid-extract-loop-with-risk-gradient/grader.ts 2>&1 | tail -5
```
Expected: demo 6/6; negative-demo fails ≥5.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-extraction/raid-extract-loop-with-risk-gradient/
git commit -m "feat(guides): add raid-extract-loop-with-risk-gradient guide + grader"
```

---

## Task 6: `loot-value-tiers-with-snowball-caps` (shooter-extraction)

**Files:** `guides/game-design-shooter-extraction/loot-value-tiers-with-snowball-caps/{guide.md, expectations.md, tasks/task.md, demo/LootTier.cs, negative-demo/LootTier.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: loot-value-tiers-with-snowball-caps
category: game-design-shooter-extraction
title: Loot value tiers with snowball caps (rare drops + insurance/secure)
description: Tiered loot value drives risk-taking in extraction shooters. Rare top-tier loot must feel earned (~5% drop), and snowball is capped via insurance / secure containers so a single bad raid doesn't wipe a season's progress.
useCases:
  - "design loot tiers in extraction shooter"
  - "Tarkov secure container design"
  - "snowball prevention extraction shooter"
  - "tiered loot drop rates"
  - "insurance system for raid death"
relatedGuides:
  - raid-extract-loop-with-risk-gradient
appliesTo:
  - "any extraction shooter with persistent gear across raids"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Loot value tiers with snowball caps

In an extraction shooter, the gear you bring INTO a raid is the gear you've earned by extracting in prior raids. This creates a positive-feedback loop that snowballs: good players accumulate gear, bring better gear next raid, get more loot, etc.

Two design knobs prevent the snowball from breaking the game:

1. **Tiered loot with rare top-tier**: most loot is mid-tier; the best stuff drops at ~5% so players still extract for the thrill of "maybe this raid is the one." This keeps mid-game players engaged.
2. **Secure containers / insurance**: a small portion of each player's gear is protected (secure slot) or refundable (insurance for cheap items). A single bad raid doesn't wipe progress.

## Implementation

```csharp
using UnityEngine;

public enum LootTier { Common, Uncommon, Rare, Legendary }

public class LootDrop : MonoBehaviour
{
    [SerializeField] private float commonChance = 0.60f;
    [SerializeField] private float uncommonChance = 0.30f;
    [SerializeField] private float rareChance = 0.08f;
    [SerializeField] private float legendaryChance = 0.02f;
    [SerializeField] private int secureSlotCount = 2;

    public LootTier RollTier(float roll01)
    {
        if (roll01 < legendaryChance) return LootTier.Legendary;
        if (roll01 < legendaryChance + rareChance) return LootTier.Rare;
        if (roll01 < legendaryChance + rareChance + uncommonChance) return LootTier.Uncommon;
        return LootTier.Common;
    }

    public bool IsSecureSlot(int slotIndex)
    {
        return slotIndex < secureSlotCount;
    }
}
```

## Avoid

- Flat distribution across tiers — top-tier loot is no longer special; mid-game players have nothing to chase.
- No secure slot — a single death wipes a player's entire kit; new players quit after one bad raid.
- Insurance covers everything — defeats the "full-loot" tension that drives the gameplay loop.
- Legendary chance > 10% — top-tier feels common, "legendary" becomes meaningless.

## Gotchas

- Drop rates should sum to ~1.0; verify with an assertion or rebalance script.
- Secure slot count interacts with map difficulty: easier maps → smaller secure slot.
- Insurance turnaround time matters: too fast (instant) = no risk; too slow (24hr) = the lost gear isn't really insured.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: loot-value-tiers-with-snowball-caps

After applying this guide, the agent's `Assets/Scripts/LootDrop.cs` should:

1. Declare a `LootTier` enum with at least 4 distinct tiers (e.g. Common, Uncommon, Rare, Legendary).
2. Declare per-tier drop-chance serialized fields summing to ~1.0.
3. The legendary (top-tier) chance must be ≤ 0.10 (rare-drop principle).
4. Declare a `secureSlotCount` (or similar) serialized integer field > 0.
5. Expose `RollTier(float roll01)` that returns the appropriate tier.
6. Expose `IsSecureSlot(int slotIndex)` that returns true for the first N slots.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/LootDrop.cs`. Provide:
- A `LootTier` enum (Common, Uncommon, Rare, Legendary).
- Per-tier serialized drop-chance fields summing to ~1.0; legendary must be ≤10%.
- `RollTier(float roll01)` that returns the tier given a random number in [0,1).
- `IsSecureSlot(int slotIndex)` that returns true if `slotIndex < secureSlotCount` (a serialized field).
```

- [ ] **Step 4: `demo/LootDrop.cs`**

```csharp
using UnityEngine;

public enum LootTier { Common, Uncommon, Rare, Legendary }

public class LootDrop : MonoBehaviour
{
    [SerializeField] private float commonChance = 0.60f;
    [SerializeField] private float uncommonChance = 0.30f;
    [SerializeField] private float rareChance = 0.08f;
    [SerializeField] private float legendaryChance = 0.02f;
    [SerializeField] private int secureSlotCount = 2;

    public LootTier RollTier(float roll01)
    {
        if (roll01 < legendaryChance) return LootTier.Legendary;
        if (roll01 < legendaryChance + rareChance) return LootTier.Rare;
        if (roll01 < legendaryChance + rareChance + uncommonChance) return LootTier.Uncommon;
        return LootTier.Common;
    }

    public bool IsSecureSlot(int slotIndex)
    {
        return slotIndex < secureSlotCount;
    }
}
```

- [ ] **Step 5: `negative-demo/LootDrop.cs`**

```csharp
using UnityEngine;

public enum LootTier { Common, Legendary }  // Only 2 tiers

public class LootDrop : MonoBehaviour
{
    // Flat 50/50 distribution; no secure slot.
    public LootTier RollTier(float roll01)
    {
        return roll01 < 0.5f ? LootTier.Legendary : LootTier.Common;
    }
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LootDrop.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares LootTier enum with ≥4 tiers', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'LootTier'));
  const m = codeOnly.match(/enum\s+LootTier\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 4, `expected ≥4 LootTier values, got ${values.length}: ${values.join(', ')}`);
});

test('legendary chance default ≤ 0.10', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?float\s+\w*[Ll]egendary[Cc]hance\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected [SerializeField] float for legendaryChance');
  const v = parseFloat(m![1]);
  assert.ok(v <= 0.10, `legendaryChance default ${v} > 0.10 — top tier should be rare`);
});

test('declares secureSlotCount serialized int > 0', () => {
  const m = codeOnly.match(/\[SerializeField\][\s\S]*?int\s+\w*[Ss]ecure\w*\s*=\s*(\d+)/);
  assert.ok(m, 'expected [SerializeField] int for secureSlotCount');
  const v = parseInt(m![1], 10);
  assert.ok(v > 0, `secureSlotCount ${v} not > 0`);
});

test('RollTier method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bRollTier\s*\(/));
});

test('IsSecureSlot method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsSecureSlot\s*\(/));
});

test('per-tier chance fields exist (common/uncommon/rare/legendary)', () => {
  assert.ok(hasPattern(codeOnly, /\bcommonChance\b/i));
  assert.ok(hasPattern(codeOnly, /\buncommonChance\b/i));
  assert.ok(hasPattern(codeOnly, /\brareChance\b/i));
  assert.ok(hasPattern(codeOnly, /\blegendaryChance\b/i));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-extraction/loot-value-tiers-with-snowball-caps/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-extraction/loot-value-tiers-with-snowball-caps/negative-demo/LootDrop.cs \
  node --experimental-strip-types --test guides/game-design-shooter-extraction/loot-value-tiers-with-snowball-caps/grader.ts 2>&1 | tail -5
```
Expected: demo 6/6; negative-demo fails ≥4.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-extraction/loot-value-tiers-with-snowball-caps/
git commit -m "feat(guides): add loot-value-tiers-with-snowball-caps guide + grader"
```

---

## Task 7: `asymmetric-session-length-design` (shooter-extraction)

**Files:** `guides/game-design-shooter-extraction/asymmetric-session-length-design/{guide.md, expectations.md, tasks/task.md, demo/RaidConfig.cs, negative-demo/RaidConfig.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: asymmetric-session-length-design
category: game-design-shooter-extraction
title: Asymmetric session-length design (short raids vs long raids)
description: Extraction shooters attract two distinct player segments — quick-session (15min) and long-session (60-90min). Design raid maps and timers so both audiences are served by the same content.
useCases:
  - "design raid length for extraction shooter"
  - "support different session lengths"
  - "raid timer tuning"
  - "Tarkov raid length variety"
  - "match player session duration to map"
relatedGuides: []
appliesTo:
  - "any extraction shooter with multiple maps or configurable raid timers"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Asymmetric session-length design

Extraction shooters serve two distinct player segments at once:
- **Short-session players** (15-25min raids): playing on lunch break, between meetings, casual play.
- **Long-session players** (60-90min raids): playing a "session," exploring map deeply, treasure-hunting.

Forcing one map onto both creates problems: long raids feel punishing to short-session players (no time to extract); short raids feel shallow to long-session players (just rush extract).

The fix is **map-tier diversity**: maintain a portfolio of maps with different raid timers, so a player can pick what fits their available time.

## Implementation

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "RaidConfig", menuName = "Game/Raid Config")]
public class RaidConfig : ScriptableObject
{
    [System.Serializable]
    public class MapTier
    {
        public string mapName;
        public float raidDurationMinutes;
        public int playerCount;
    }

    public MapTier shortRaid = new MapTier
    {
        mapName = "Customs",
        raidDurationMinutes = 20f,
        playerCount = 8,
    };

    public MapTier mediumRaid = new MapTier
    {
        mapName = "Woods",
        raidDurationMinutes = 40f,
        playerCount = 10,
    };

    public MapTier longRaid = new MapTier
    {
        mapName = "Streets",
        raidDurationMinutes = 75f,
        playerCount = 14,
    };
}
```

## Avoid

- All maps with the same timer — alienates one player segment entirely.
- Player-configurable raid timer (slider) — sounds good but destroys map balance (a 15min raid on a 60min-tuned map is just a deathmatch).
- Long raids without "early extract" — long-session players need the option to bail out 30min in if real life calls.

## Gotchas

- Player count should scale with raid duration roughly — longer raids accommodate more players because there's more spatial elbow room.
- Loot density on long maps should NOT scale 1:1 with duration; otherwise long raids are strictly better. Tune at ~70% rate to make short raids competitive per minute.
- Server matching should respect tier preference (don't drop a 20min-tier player into a 75min-tier queue).
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: asymmetric-session-length-design

After applying this guide, the agent's `Assets/Scripts/RaidConfig.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `MapTier` inner class (or similar) with `mapName`, `raidDurationMinutes`, `playerCount` fields.
3. Have at least 3 raid-tier fields (short / medium / long).
4. The short raid duration should be ≤ 25 minutes.
5. The long raid duration should be ≥ 60 minutes.
6. Medium raid duration should be between short and long.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/RaidConfig.cs` as a ScriptableObject with three raid-tier configurations:
- `shortRaid`: 15-25min, ~8 players.
- `mediumRaid`: 30-50min, ~10 players.
- `longRaid`: 60-90min, ~14 players.

Use an inner `MapTier` serializable class with `mapName`, `raidDurationMinutes`, `playerCount`.
```

- [ ] **Step 4: `demo/RaidConfig.cs`**

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "RaidConfig", menuName = "Game/Raid Config")]
public class RaidConfig : ScriptableObject
{
    [System.Serializable]
    public class MapTier
    {
        public string mapName;
        public float raidDurationMinutes;
        public int playerCount;
    }

    public MapTier shortRaid = new MapTier { mapName = "Customs", raidDurationMinutes = 20f, playerCount = 8 };
    public MapTier mediumRaid = new MapTier { mapName = "Woods", raidDurationMinutes = 40f, playerCount = 10 };
    public MapTier longRaid = new MapTier { mapName = "Streets", raidDurationMinutes = 75f, playerCount = 14 };
}
```

- [ ] **Step 5: `negative-demo/RaidConfig.cs`**

```csharp
using UnityEngine;

public class RaidConfig : MonoBehaviour
{
    public float allMapsDuration = 45f;  // single timer for all maps
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RaidConfig.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /:\s*ScriptableObject\b/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares MapTier (or similar) inner class with required fields', () => {
  assert.ok(hasPattern(codeOnly, /\bclass\s+\w*[Mm]ap[Tt]ier\w*/) || hasPattern(codeOnly, /\bMapTier\b/));
  assert.ok(hasPattern(codeOnly, /\bmapName\b/));
  assert.ok(hasPattern(codeOnly, /\braidDurationMinutes\b/));
  assert.ok(hasPattern(codeOnly, /\bplayerCount\b/));
});

test('declares 3 tier fields (shortRaid, mediumRaid, longRaid)', () => {
  assert.ok(hasPattern(codeOnly, /\bshortRaid\b/));
  assert.ok(hasPattern(codeOnly, /\bmediumRaid\b/));
  assert.ok(hasPattern(codeOnly, /\blongRaid\b/));
});

test('shortRaid duration ≤ 25 minutes', () => {
  const m = codeOnly.match(/shortRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected shortRaid.raidDurationMinutes literal');
  assert.ok(parseFloat(m![1]) <= 25, `shortRaid duration ${m![1]} > 25`);
});

test('longRaid duration ≥ 60 minutes', () => {
  const m = codeOnly.match(/longRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected longRaid.raidDurationMinutes literal');
  assert.ok(parseFloat(m![1]) >= 60, `longRaid duration ${m![1]} < 60`);
});

test('mediumRaid duration strictly between short and long', () => {
  const sm = codeOnly.match(/shortRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  const mm = codeOnly.match(/mediumRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  const lm = codeOnly.match(/longRaid\s*=[\s\S]*?raidDurationMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(sm && mm && lm, 'expected all three raidDurationMinutes literals');
  const s = parseFloat(sm![1]), m = parseFloat(mm![1]), l = parseFloat(lm![1]);
  assert.ok(s < m && m < l, `expected short(${s}) < medium(${m}) < long(${l})`);
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-extraction/asymmetric-session-length-design/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-extraction/asymmetric-session-length-design/negative-demo/RaidConfig.cs \
  node --experimental-strip-types --test guides/game-design-shooter-extraction/asymmetric-session-length-design/grader.ts 2>&1 | tail -5
```
Expected: demo 6/6; negative-demo fails ≥5.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-extraction/asymmetric-session-length-design/
git commit -m "feat(guides): add asymmetric-session-length-design guide + grader"
```

---

## Task 8: `round-based-economy-reset` (shooter-competitive)

**Files:** `guides/game-design-shooter-competitive/round-based-economy-reset/{guide.md, expectations.md, tasks/task.md, demo/EconomySystem.cs, negative-demo/EconomySystem.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: round-based-economy-reset
category: game-design-shooter-competitive
title: Round-based economy reset (CS-style buy phase)
description: In a round-based competitive shooter, money/utility resets (partially) per round. Tune reset rules to prevent runaway snowball while still rewarding round wins meaningfully.
useCases:
  - "design buy phase in competitive shooter"
  - "round economy in Counter-Strike style game"
  - "force buy vs eco round design"
  - "loss bonus tuning"
  - "money reset between rounds"
relatedGuides: []
appliesTo:
  - "any round-based competitive shooter with weapon-purchase economy"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Round-based economy reset

In CS-style games, players don't earn gear permanently — they buy it each round using money earned from prior rounds. The economy creates strategic depth: a team on a losing streak gets bigger "loss bonuses" to enable a force-buy.

Design knobs:
1. **Round-end bonus tiers**: win pays well, loss pays less (but escalates on losing streaks).
2. **Per-kill reward**: small per-kill payout to reward engagement even on losing rounds.
3. **Money cap**: rich players have limited surplus; can't hoard infinitely.

## Implementation

```csharp
using UnityEngine;

public class EconomySystem : MonoBehaviour
{
    [SerializeField] private int startingMoney = 800;
    [SerializeField] private int winBonus = 3250;
    [SerializeField] private int baseLossBonus = 1400;
    [SerializeField] private int lossStreakIncrement = 500;
    [SerializeField] private int maxLossBonus = 3400;
    [SerializeField] private int killReward = 300;
    [SerializeField] private int moneyCap = 16000;

    public int LossBonusForStreak(int consecutiveLosses)
    {
        int bonus = baseLossBonus + Mathf.Max(0, consecutiveLosses - 1) * lossStreakIncrement;
        return Mathf.Min(bonus, maxLossBonus);
    }

    public int AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)
    {
        int reward = wonRound ? winBonus : LossBonusForStreak(consecutiveLosses);
        reward += kills * killReward;
        return Mathf.Min(currentMoney + reward, moneyCap);
    }
}
```

## Avoid

- No money cap — top teams hoard, force-buy becomes irrelevant (they always have cash).
- No loss bonus — a team on a losing streak can't afford gear, snowballs into 16-0 stomp.
- Loss bonus > win bonus — sandbags incentivize losing rounds for the larger payout.
- Per-kill reward larger than round bonus — undermines the round-as-unit-of-play principle.

## Gotchas

- Loss-streak bonus should reset on a win (otherwise teams that occasionally win still accumulate "loss benefits").
- Starting money calibration matters: too high → first-round full buy, no eco; too low → first round is always a save.
- Match the cap to typical full-buy cost × 1.3 — too high and players can stockpile for late-game super-buys; too low and a frugal player has nothing to spend money on.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: round-based-economy-reset

After applying this guide, the agent's `Assets/Scripts/EconomySystem.cs` should:

1. Declare serialized fields for: `startingMoney`, `winBonus`, `baseLossBonus`, `lossStreakIncrement`, `maxLossBonus`, `killReward`, `moneyCap`.
2. The win bonus should be GREATER than the maxLossBonus (winning > losing).
3. Per-kill reward should be ≤ baseLossBonus / 2 (kills are flavor, not primary income).
4. Expose `LossBonusForStreak(int consecutiveLosses)` that escalates with streak length, capped at maxLossBonus.
5. Expose `AddRoundReward(int, bool, int, int)` that applies the per-round bonus, kill reward, and clamps to moneyCap.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/EconomySystem.cs` for a round-based competitive shooter. Provide:
- `LossBonusForStreak(int consecutiveLosses)` returning a streak-escalated bonus (baseLossBonus + (streak-1)*increment), capped at maxLossBonus.
- `AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)` returning the new money total (clamped at moneyCap).

Use serialized fields for all economy tuning so designers can rebalance without code changes.
```

- [ ] **Step 4: `demo/EconomySystem.cs`**

```csharp
using UnityEngine;

public class EconomySystem : MonoBehaviour
{
    [SerializeField] private int startingMoney = 800;
    [SerializeField] private int winBonus = 3250;
    [SerializeField] private int baseLossBonus = 1400;
    [SerializeField] private int lossStreakIncrement = 500;
    [SerializeField] private int maxLossBonus = 3400;
    [SerializeField] private int killReward = 300;
    [SerializeField] private int moneyCap = 16000;

    public int LossBonusForStreak(int consecutiveLosses)
    {
        int bonus = baseLossBonus + Mathf.Max(0, consecutiveLosses - 1) * lossStreakIncrement;
        return Mathf.Min(bonus, maxLossBonus);
    }

    public int AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)
    {
        int reward = wonRound ? winBonus : LossBonusForStreak(consecutiveLosses);
        reward += kills * killReward;
        return Mathf.Min(currentMoney + reward, moneyCap);
    }
}
```

- [ ] **Step 5: `negative-demo/EconomySystem.cs`**

```csharp
using UnityEngine;

public class EconomySystem : MonoBehaviour
{
    // No loss bonus. No money cap. Huge per-kill reward (sandbagging incentive).
    [SerializeField] private int winBonus = 1000;
    [SerializeField] private int killReward = 2000;

    public int AddRoundReward(int currentMoney, bool wonRound, int kills, int consecutiveLosses)
    {
        if (wonRound) currentMoney += winBonus;
        currentMoney += kills * killReward;
        return currentMoney;  // no cap
    }
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EconomySystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

const winM = codeOnly.match(/\bwinBonus\s*=\s*(\d+)/);
const baseLossM = codeOnly.match(/\bbaseLossBonus\s*=\s*(\d+)/);
const maxLossM = codeOnly.match(/\bmaxLossBonus\s*=\s*(\d+)/);
const killM = codeOnly.match(/\bkillReward\s*=\s*(\d+)/);

test('declares all required serialized economy fields', () => {
  for (const name of ['winBonus', 'baseLossBonus', 'lossStreakIncrement', 'maxLossBonus', 'killReward', 'moneyCap']) {
    assert.ok(hasPattern(codeOnly, new RegExp(`\\[SerializeField\\][\\s\\S]*?\\b${name}\\b`)), `missing [SerializeField] ${name}`);
  }
});

test('winBonus > maxLossBonus (winning beats losing)', () => {
  assert.ok(winM && maxLossM, 'expected winBonus and maxLossBonus literals');
  assert.ok(parseInt(winM![1], 10) > parseInt(maxLossM![1], 10),
    `winBonus ${winM![1]} should be > maxLossBonus ${maxLossM![1]}`);
});

test('killReward ≤ baseLossBonus / 2 (kills are flavor, not primary income)', () => {
  assert.ok(killM && baseLossM, 'expected killReward and baseLossBonus literals');
  assert.ok(parseInt(killM![1], 10) <= parseInt(baseLossM![1], 10) / 2,
    `killReward ${killM![1]} > baseLossBonus / 2 = ${parseInt(baseLossM![1], 10) / 2}`);
});

test('LossBonusForStreak method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bLossBonusForStreak\s*\(/));
});

test('AddRoundReward clamps to moneyCap via Mathf.Min', () => {
  assert.ok(hasPattern(codeOnly, /\bAddRoundReward\s*\(/));
  assert.ok(hasPattern(codeOnly, /Mathf\.Min\s*\([^)]*moneyCap/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-competitive/round-based-economy-reset/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-competitive/round-based-economy-reset/negative-demo/EconomySystem.cs \
  node --experimental-strip-types --test guides/game-design-shooter-competitive/round-based-economy-reset/grader.ts 2>&1 | tail -5
```
Expected: demo 5/5; negative-demo fails ≥4.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-competitive/round-based-economy-reset/
git commit -m "feat(guides): add round-based-economy-reset guide + grader"
```

---

## Task 9: `role-utility-orthogonality` (shooter-competitive)

**Files:** `guides/game-design-shooter-competitive/role-utility-orthogonality/{guide.md, expectations.md, tasks/task.md, demo/RoleUtility.cs, negative-demo/RoleUtility.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: role-utility-orthogonality
category: game-design-shooter-competitive
title: Role / utility orthogonality (each class brings distinct utility)
description: In a team-based competitive shooter, each class/agent should bring orthogonal utility (smokes / flashes / intel / heal) so team composition matters. Avoid the "best pick" problem where one class dominates regardless of comp.
useCases:
  - "design class roles in team shooter"
  - "avoid hero shooter best pick problem"
  - "utility orthogonality in Valorant"
  - "ability variety per agent class"
  - "balance team comp variety"
relatedGuides:
  - round-based-economy-reset
appliesTo:
  - "any team-based competitive shooter with class/agent selection"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Role / utility orthogonality

In a team-based competitive shooter, the strategic depth comes from team composition. For comp to matter, each class must bring tools the OTHERS DON'T HAVE. If every class has a smoke + a flash + a heal, then the only differentiator is raw weapon stats — comp collapses to "pick the best DPS."

Design principle: each class's utility set should be **orthogonal** to others — different tool categories, not different flavors of the same tool.

## Implementation

```csharp
using UnityEngine;

public enum UtilityCategory { Smoke, Flash, Intel, Heal, Mobility, Trap, Wall }

[CreateAssetMenu(fileName = "AgentClass", menuName = "Game/Agent Class")]
public class AgentClass : ScriptableObject
{
    public string className;
    public UtilityCategory[] utilityCategories;  // typically 2-3 per class
    public int weaponDamage = 30;  // intentionally close to other classes
    public float moveSpeed = 5f;
}
```

For example, valid orthogonal comps:
- Smoker (Smoke + Flash) + Intel (Intel + Trap) + Medic (Heal + Mobility)
- Each fills a niche the others can't.

Compare to a NON-orthogonal design:
- Class A: smoke + flash + heal
- Class B: smoke + flash + heal
- Class C: smoke + flash + heal
- → only "best DPS" matters.

## Avoid

- Every class with the same utility categories — degenerates to flat DPS competition.
- One class with all the utility (4+ categories) — "best pick" no matter what comp.
- Universal heal that every class can self-cast — removes the support role's reason to exist.

## Gotchas

- Weapon damage should NOT vary widely across classes — gunplay should feel similar. Differentiation lives in utility, not in primary fire.
- Move speed differences should be ≤20% — large speed gaps make slow classes feel oppressive to play.
- Cap a single class at 3 utility categories. More than that and the class is "best pick."
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: role-utility-orthogonality

After applying this guide, the agent's `Assets/Scripts/AgentClass.cs` should:

1. Declare a `UtilityCategory` enum with at least 5 distinct categories.
2. `AgentClass` should be a ScriptableObject with `[CreateAssetMenu]`.
3. Declare a `utilityCategories` array field of `UtilityCategory[]` (the agent's specific utilities).
4. Have a `weaponDamage` field (primary fire damage; orthogonality says this should be ~similar across classes).
5. Have a `moveSpeed` field.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/AgentClass.cs` as a ScriptableObject describing an agent in a team-based competitive shooter. Provide:
- A `UtilityCategory` enum with ≥5 distinct categories (Smoke, Flash, Intel, Heal, Mobility, Trap, Wall, etc.).
- A `utilityCategories` array field — the SUBSET this agent has (typically 2-3 categories).
- A `weaponDamage` field (kept similar across agent classes).
- A `moveSpeed` field.
```

- [ ] **Step 4: `demo/AgentClass.cs`**

```csharp
using UnityEngine;

public enum UtilityCategory { Smoke, Flash, Intel, Heal, Mobility, Trap, Wall }

[CreateAssetMenu(fileName = "AgentClass", menuName = "Game/Agent Class")]
public class AgentClass : ScriptableObject
{
    public string className;
    public UtilityCategory[] utilityCategories;
    public int weaponDamage = 30;
    public float moveSpeed = 5f;
}
```

- [ ] **Step 5: `negative-demo/AgentClass.cs`**

```csharp
using UnityEngine;

// Only one utility category enum value. No orthogonality possible.
public enum UtilityCategory { Damage }

public class AgentClass : MonoBehaviour
{
    public string className;
    public int weaponDamage = 30;
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'AgentClass.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares UtilityCategory enum with ≥5 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'UtilityCategory'));
  const m = codeOnly.match(/enum\s+UtilityCategory\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 UtilityCategory values, got ${values.length}: ${values.join(', ')}`);
});

test('AgentClass extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /AgentClass\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares utilityCategories as UtilityCategory[]', () => {
  assert.ok(hasPattern(codeOnly, /\bUtilityCategory\[\]\s+utilityCategories\b/));
});

test('has weaponDamage field', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+weaponDamage\b/));
});

test('has moveSpeed field', () => {
  assert.ok(hasPattern(codeOnly, /\bfloat\s+moveSpeed\b/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-competitive/role-utility-orthogonality/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-competitive/role-utility-orthogonality/negative-demo/AgentClass.cs \
  node --experimental-strip-types --test guides/game-design-shooter-competitive/role-utility-orthogonality/grader.ts 2>&1 | tail -5
```
Expected: demo 5/5; negative-demo fails ≥4.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-competitive/role-utility-orthogonality/
git commit -m "feat(guides): add role-utility-orthogonality guide + grader"
```

---

## Task 10: `esports-readable-visual-design` (shooter-competitive)

**Files:** `guides/game-design-shooter-competitive/esports-readable-visual-design/{guide.md, expectations.md, tasks/task.md, demo/EsportsReadability.cs, negative-demo/EsportsReadability.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: esports-readable-visual-design
category: game-design-shooter-competitive
title: Esports-readable visual design (silhouettes, kill-feed, observer mode)
description: Competitive shooters live or die by spectator clarity. Distinct silhouettes, high-contrast kill-feeds, and a usable observer mode determine whether broadcasts can build a community.
useCases:
  - "design for esports broadcasting"
  - "spectator readability in competitive shooter"
  - "kill-feed visual design"
  - "agent silhouette differentiation"
  - "observer mode UI"
relatedGuides: []
appliesTo:
  - "any competitive shooter with spectator / esports aspirations"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Esports-readable visual design

A competitive shooter that aspires to esports must answer: can a viewer who has never played the game follow the action? If not, the broadcast can't build an audience, and the meta-community starves.

Three pillars:
1. **Silhouette differentiation**: each agent's body shape (or color identity) is distinguishable at a glance, even from 100m.
2. **Kill-feed readability**: kill notifications use distinct iconography (weapon + headshot indicator), persist long enough to read.
3. **Observer mode**: free-cam with predictable controls, ability to follow any player, hide HUD chrome.

## Implementation

```csharp
using UnityEngine;

public class EsportsReadability : MonoBehaviour
{
    [SerializeField] private Color teamAColor = Color.cyan;
    [SerializeField] private Color teamBColor = Color.red;
    [SerializeField] private float killFeedPersistSeconds = 5f;
    [SerializeField] private bool observerModeEnabled = true;
    [SerializeField] private bool observerHidesHud = true;

    /// Minimum perceptual color distance between the two team colors (DeltaE76 simplified).
    public float TeamColorContrast()
    {
        return Vector3.Distance(
            new Vector3(teamAColor.r, teamAColor.g, teamAColor.b),
            new Vector3(teamBColor.r, teamBColor.g, teamBColor.b));
    }

    public bool IsKillFeedReadable() => killFeedPersistSeconds >= 3f && killFeedPersistSeconds <= 10f;

    public bool IsObserverModeReady() => observerModeEnabled && observerHidesHud;
}
```

## Avoid

- Same/similar team colors — viewers can't tell teams apart, broadcasts become incoherent.
- Kill feed that persists <3s — viewers can't read who killed whom in fast action.
- Observer mode without HUD-hide — broadcasts have to use third-party overlays.
- Agent silhouettes that share the same outline at distance — viewers misidentify, leading to wrong-strategy reads.

## Gotchas

- "Team color" can't be the SAME hue across maps (every map has team A always-blue). Allow per-map color overrides if needed for visibility against backgrounds.
- Kill-feed icons need outlines / drop-shadows so they read on bright AND dark backgrounds.
- Observer mode should support tournament-grade features: replay scrubbing, multi-player picture-in-picture, ability to spec dead players.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: esports-readable-visual-design

After applying this guide, the agent's `Assets/Scripts/EsportsReadability.cs` should:

1. Have `teamAColor` and `teamBColor` serialized Color fields.
2. Have a `killFeedPersistSeconds` serialized field in [3, 10].
3. Have a `observerModeEnabled` serialized bool defaulting to true.
4. Have a `observerHidesHud` serialized bool defaulting to true.
5. Expose `TeamColorContrast()` returning a numeric distance between the two team colors.
6. Expose `IsKillFeedReadable()` and `IsObserverModeReady()`.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/EsportsReadability.cs`. Provide:
- Serialized `teamAColor`/`teamBColor` (Color) and `killFeedPersistSeconds`/`observerModeEnabled`/`observerHidesHud` fields.
- `TeamColorContrast()` returning the RGB distance between team colors.
- `IsKillFeedReadable()` returning true when `killFeedPersistSeconds` is in [3, 10].
- `IsObserverModeReady()` returning true only when observer mode is enabled AND HUD-hide is on.
```

- [ ] **Step 4: `demo/EsportsReadability.cs`**

```csharp
using UnityEngine;

public class EsportsReadability : MonoBehaviour
{
    [SerializeField] private Color teamAColor = Color.cyan;
    [SerializeField] private Color teamBColor = Color.red;
    [SerializeField] private float killFeedPersistSeconds = 5f;
    [SerializeField] private bool observerModeEnabled = true;
    [SerializeField] private bool observerHidesHud = true;

    public float TeamColorContrast()
    {
        return Vector3.Distance(
            new Vector3(teamAColor.r, teamAColor.g, teamAColor.b),
            new Vector3(teamBColor.r, teamBColor.g, teamBColor.b));
    }

    public bool IsKillFeedReadable() => killFeedPersistSeconds >= 3f && killFeedPersistSeconds <= 10f;
    public bool IsObserverModeReady() => observerModeEnabled && observerHidesHud;
}
```

- [ ] **Step 5: `negative-demo/EsportsReadability.cs`**

```csharp
using UnityEngine;

public class EsportsReadability : MonoBehaviour
{
    // Both teams red. Kill feed flashes for 1s. No observer mode.
    [SerializeField] private Color teamAColor = Color.red;
    [SerializeField] private Color teamBColor = Color.red;
    [SerializeField] private float killFeedPersistSeconds = 1f;
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EsportsReadability.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares teamAColor and teamBColor serialized Color fields', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?Color\s+teamAColor\b/));
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?Color\s+teamBColor\b/));
});

test('killFeedPersistSeconds default in [3, 10]', () => {
  const m = codeOnly.match(/killFeedPersistSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected killFeedPersistSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 3 && v <= 10, `killFeedPersistSeconds default ${v} not in [3, 10]`);
});

test('observerModeEnabled and observerHidesHud fields exist', () => {
  assert.ok(hasPattern(codeOnly, /\bobserverModeEnabled\b/));
  assert.ok(hasPattern(codeOnly, /\bobserverHidesHud\b/));
});

test('TeamColorContrast method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bTeamColorContrast\s*\(/));
});

test('IsKillFeedReadable and IsObserverModeReady exist', () => {
  assert.ok(hasPattern(codeOnly, /\bIsKillFeedReadable\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bIsObserverModeReady\s*\(/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-competitive/esports-readable-visual-design/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-competitive/esports-readable-visual-design/negative-demo/EsportsReadability.cs \
  node --experimental-strip-types --test guides/game-design-shooter-competitive/esports-readable-visual-design/grader.ts 2>&1 | tail -5
```
Expected: demo 5/5; negative-demo fails ≥2.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-competitive/esports-readable-visual-design/
git commit -m "feat(guides): add esports-readable-visual-design guide + grader"
```

---

## Task 11: `combat-puzzle-pacing` (shooter-singleplayer)

**Files:** `guides/game-design-shooter-singleplayer/combat-puzzle-pacing/{guide.md, expectations.md, tasks/task.md, demo/CombatEncounter.cs, negative-demo/CombatEncounter.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: combat-puzzle-pacing
category: game-design-shooter-singleplayer
title: Combat puzzle pacing (encounter as resource-management puzzle)
description: In a singleplayer FPS, each combat encounter is a small puzzle: limited ammo, varied enemy types, environment hazards. The "puzzle" is which tools to use where.
useCases:
  - "design FPS combat encounters"
  - "DOOM 2016 push-forward combat"
  - "resource management between encounters"
  - "enemy variety per encounter"
  - "FPS arena design"
relatedGuides: []
appliesTo:
  - "any singleplayer FPS or action game with combat-puzzle encounters"
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
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: combat-puzzle-pacing

After applying this guide, the agent's `Assets/Scripts/CombatEncounter.cs` should:

1. Declare an `EnemyWave` serializable class with `enemyTypes`, `totalEnemyCount`, `intensityCurve` fields.
2. Have a `waves` array serialized field.
3. Have `ammoDropMin` and `ammoDropMax` serialized fields (with min < max).
4. Have a `postEncounterHealthFraction` serialized field in (0, 1].
5. Expose `IsValid()` that returns true only when there are ≥2 waves AND each wave has ≥2 enemy types.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/CombatEncounter.cs` for a singleplayer FPS encounter. Provide:
- An `EnemyWave` serializable inner class with `enemyTypes` (string[]), `totalEnemyCount` (int), `intensityCurve` (float).
- Serialized fields: `waves` (EnemyWave[]), `ammoDropMin`/`ammoDropMax` (int, min < max), `postEncounterHealthFraction` (float in (0,1]).
- `IsValid()` returning true only if ≥2 waves exist AND each wave has ≥2 distinct enemy types.
```

- [ ] **Step 4: `demo/CombatEncounter.cs`**

```csharp
using UnityEngine;

[System.Serializable]
public class EnemyWave
{
    public string[] enemyTypes;
    public int totalEnemyCount;
    public float intensityCurve;
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

- [ ] **Step 5: `negative-demo/CombatEncounter.cs`**

```csharp
using UnityEngine;

public class CombatEncounter : MonoBehaviour
{
    [SerializeField] private int enemyCount = 5;
    [SerializeField] private string enemyType = "grunt";  // one type, no waves
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'CombatEncounter.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('declares EnemyWave serializable class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'EnemyWave'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bstring\[\]\s+enemyTypes\b/));
  assert.ok(hasPattern(codeOnly, /\bint\s+totalEnemyCount\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+intensityCurve\b/));
});

test('declares waves array field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?EnemyWave\[\]\s+waves/));
});

test('declares ammoDropMin/ammoDropMax with min < max', () => {
  const minM = codeOnly.match(/ammoDropMin\s*=\s*(\d+)/);
  const maxM = codeOnly.match(/ammoDropMax\s*=\s*(\d+)/);
  assert.ok(minM && maxM, 'expected ammoDropMin and ammoDropMax literals');
  assert.ok(parseInt(minM![1], 10) < parseInt(maxM![1], 10),
    `ammoDropMin ${minM![1]} should be < ammoDropMax ${maxM![1]}`);
});

test('postEncounterHealthFraction in (0, 1]', () => {
  const m = codeOnly.match(/postEncounterHealthFraction\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected postEncounterHealthFraction literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 1, `postEncounterHealthFraction ${v} not in (0, 1]`);
});

test('IsValid method exists and checks wave count', () => {
  assert.ok(hasPattern(codeOnly, /\bbool\s+IsValid\s*\(/));
  assert.ok(hasPattern(codeOnly, /waves\.Length\s*<\s*2/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-singleplayer/combat-puzzle-pacing/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-singleplayer/combat-puzzle-pacing/negative-demo/CombatEncounter.cs \
  node --experimental-strip-types --test guides/game-design-shooter-singleplayer/combat-puzzle-pacing/grader.ts 2>&1 | tail -5
```
Expected: demo 5/5; negative-demo fails ≥3.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-singleplayer/combat-puzzle-pacing/
git commit -m "feat(guides): add combat-puzzle-pacing guide + grader"
```

---

## Task 12: `weapon-pickup-as-narrative-beat` (shooter-singleplayer)

**Files:** `guides/game-design-shooter-singleplayer/weapon-pickup-as-narrative-beat/{guide.md, expectations.md, tasks/task.md, demo/WeaponPickup.cs, negative-demo/WeaponPickup.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: weapon-pickup-as-narrative-beat
category: game-design-shooter-singleplayer
title: Weapon pickup as narrative beat (placement = story chapter)
description: In a singleplayer FPS, each new weapon pickup is the gameplay-equivalent of a story chapter break. Time and place pickups to map to story acts, not just to combat needs.
useCases:
  - "weapon progression in singleplayer FPS"
  - "weapon pickup placement"
  - "DOOM weapon progression"
  - "narrative beat via gameplay"
  - "act structure via weapon unlocks"
relatedGuides: []
appliesTo:
  - "any singleplayer FPS or action game with progressive weapon unlocks"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Weapon pickup as narrative beat

In a narrative-driven singleplayer FPS, getting a new weapon is the player's most visceral progress signal. Half-Life 2 gives the gravity gun at a specific moment because that moment IS the chapter. DOOM 2016 unlocks the Super Shotgun where it does because that mission is the difficulty escalation point.

Pickup placement isn't just combat tuning — it's story pacing.

## Implementation

```csharp
using UnityEngine;

public enum StoryAct { Act1Intro, Act2Rising, Act3Climax, Act4Resolution }

[CreateAssetMenu(fileName = "WeaponPickup", menuName = "Game/Weapon Pickup")]
public class WeaponPickup : ScriptableObject
{
    public string weaponName;
    public StoryAct act;
    public int actMissionIndex;       // which mission within the act
    public bool isNarrativeBeat;      // tagged as story-defining pickup
}
```

The level designer specifies WHEN in the story arc each weapon arrives. A `bool isNarrativeBeat` flag marks the "chapter" pickups (your gravity gun, your BFG) vs. the routine combat pickups.

## Avoid

- Weapon pickups scattered randomly across the campaign — no narrative pacing.
- All weapons available in Act 1 — kills progression entirely; player has no toolkit growth.
- Story-critical weapons given quietly in a side room — defeats the narrative beat purpose.
- Final-act weapons available in Act 1 (cheese strats) — breaks the difficulty curve.

## Gotchas

- The `isNarrativeBeat` flag should be sparse — typically 1-3 per game. More than that and EVERY pickup feels "important," diluting the signal.
- The level designer should use `actMissionIndex` to enforce ordering — pickup in mission 2.3 must come before mission 3.1, even if you reorder missions later.
- Weapon pickups during a major story moment should pause/slow gameplay slightly so the player notices the new weapon.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: weapon-pickup-as-narrative-beat

After applying this guide, the agent's `Assets/Scripts/WeaponPickup.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `StoryAct` enum with at least 4 distinct acts (intro, rising, climax, resolution).
3. Have a `weaponName` field.
4. Have a `act` field of type `StoryAct`.
5. Have an `actMissionIndex` integer field.
6. Have an `isNarrativeBeat` bool field.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/WeaponPickup.cs` as a ScriptableObject describing a weapon pickup in a singleplayer FPS. Provide:
- A `StoryAct` enum (Act1Intro, Act2Rising, Act3Climax, Act4Resolution).
- Fields: `weaponName` (string), `act` (StoryAct), `actMissionIndex` (int), `isNarrativeBeat` (bool).
```

- [ ] **Step 4: `demo/WeaponPickup.cs`**

```csharp
using UnityEngine;

public enum StoryAct { Act1Intro, Act2Rising, Act3Climax, Act4Resolution }

[CreateAssetMenu(fileName = "WeaponPickup", menuName = "Game/Weapon Pickup")]
public class WeaponPickup : ScriptableObject
{
    public string weaponName;
    public StoryAct act;
    public int actMissionIndex;
    public bool isNarrativeBeat;
}
```

- [ ] **Step 5: `negative-demo/WeaponPickup.cs`**

```csharp
using UnityEngine;

public class WeaponPickup : MonoBehaviour
{
    public string weaponName;  // no story act, no narrative beat flag
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'WeaponPickup.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('WeaponPickup extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /WeaponPickup\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares StoryAct enum with ≥4 acts', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'StoryAct'));
  const m = codeOnly.match(/enum\s+StoryAct\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 4, `expected ≥4 StoryAct values, got ${values.length}: ${values.join(', ')}`);
});

test('has weaponName field', () => {
  assert.ok(hasPattern(codeOnly, /\bstring\s+weaponName\b/));
});

test('has act field of type StoryAct', () => {
  assert.ok(hasPattern(codeOnly, /\bStoryAct\s+act\b/));
});

test('has actMissionIndex int field', () => {
  assert.ok(hasPattern(codeOnly, /\bint\s+actMissionIndex\b/));
});

test('has isNarrativeBeat bool field', () => {
  assert.ok(hasPattern(codeOnly, /\bbool\s+isNarrativeBeat\b/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-singleplayer/weapon-pickup-as-narrative-beat/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-singleplayer/weapon-pickup-as-narrative-beat/negative-demo/WeaponPickup.cs \
  node --experimental-strip-types --test guides/game-design-shooter-singleplayer/weapon-pickup-as-narrative-beat/grader.ts 2>&1 | tail -5
```
Expected: demo 6/6; negative-demo fails ≥4.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-singleplayer/weapon-pickup-as-narrative-beat/
git commit -m "feat(guides): add weapon-pickup-as-narrative-beat guide + grader"
```

---

## Task 13: `set-piece-cadence` (shooter-singleplayer)

**Files:** `guides/game-design-shooter-singleplayer/set-piece-cadence/{guide.md, expectations.md, tasks/task.md, demo/SetPieceCadence.cs, negative-demo/SetPieceCadence.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
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
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: set-piece-cadence

After applying this guide, the agent's `Assets/Scripts/SetPieceCadence.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `SetPieceType` enum with at least 5 distinct types.
3. Declare a `CadenceEntry` serializable inner class with `type`, `minutesIntoMission`, `durationMinutes` fields.
4. Have a `cadence` array field.
5. Have a `targetSpacingMinutes` serialized field in [15, 45].
6. Expose `IsValidCadence()` returning false if any two entries are closer than half the target spacing.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/SetPieceCadence.cs` as a ScriptableObject. Provide:
- A `SetPieceType` enum with at least 5 types (Chase, Defend, Ambush, Vehicle, Sandbox, Stealth).
- A `CadenceEntry` serializable inner class with `type`, `minutesIntoMission`, `durationMinutes`.
- Serialized `cadence` (CadenceEntry[]) and `targetSpacingMinutes` (float, default ~25).
- `IsValidCadence()` returning true only when cadence entries are spaced ≥ targetSpacingMinutes/2 apart.
```

- [ ] **Step 4: `demo/SetPieceCadence.cs`**

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
        for (int i = 1; i < cadence.Length; i++)
        {
            float gap = cadence[i].minutesIntoMission - cadence[i - 1].minutesIntoMission;
            if (gap < targetSpacingMinutes / 2f) return false;
        }
        return true;
    }
}
```

- [ ] **Step 5: `negative-demo/SetPieceCadence.cs`**

```csharp
using UnityEngine;

public enum SetPieceType { Combat }  // only 1 type

public class SetPieceCadence : MonoBehaviour
{
    public float spacingMinutes = 5f;  // way too dense
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'SetPieceCadence.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('SetPieceCadence extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /SetPieceCadence\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares SetPieceType enum with ≥5 types', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'SetPieceType'));
  const m = codeOnly.match(/enum\s+SetPieceType\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 SetPieceType values, got ${values.length}: ${values.join(', ')}`);
});

test('declares CadenceEntry serializable inner class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'CadenceEntry'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bSetPieceType\s+type\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+minutesIntoMission\b/));
  assert.ok(hasPattern(codeOnly, /\bfloat\s+durationMinutes\b/));
});

test('has cadence array field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?CadenceEntry\[\]\s+cadence/));
});

test('targetSpacingMinutes in [15, 45]', () => {
  const m = codeOnly.match(/targetSpacingMinutes\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected targetSpacingMinutes literal');
  const v = parseFloat(m![1]);
  assert.ok(v >= 15 && v <= 45, `targetSpacingMinutes ${v} not in [15, 45]`);
});

test('IsValidCadence method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bIsValidCadence\s*\(/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-shooter-singleplayer/set-piece-cadence/grader.ts 2>&1 | tail -5
TARGET_FILE=$(pwd)/guides/game-design-shooter-singleplayer/set-piece-cadence/negative-demo/SetPieceCadence.cs \
  node --experimental-strip-types --test guides/game-design-shooter-singleplayer/set-piece-cadence/grader.ts 2>&1 | tail -5
```
Expected: demo 6/6; negative-demo fails ≥4.

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-shooter-singleplayer/set-piece-cadence/
git commit -m "feat(guides): add set-piece-cadence guide + grader"
```

---

## Task 14: Refresh corpus + verify all graders (24 total)

**Files:** `serving/lib/use-cases.gen.ts`, `serving/lib/embeddings.gen.bin` (regenerated); `serving/build/` (rebuilt)

- [ ] **Step 1: Regenerate corpus**

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types scripts/build-guides.ts
```
Expected: prints `Built N use cases from 24 guide(s) into ...`. N ≈ 110–125 (24 × ~5 useCases each).

- [ ] **Step 2: Rebuild bundle (for published-CLI smoke)**

```bash
node --experimental-strip-types skills-cli/build-dist.ts
```

- [ ] **Step 3: Verify all graders calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -5
```
Expected: `All 24 graders calibrated.`

- [ ] **Step 4: Smoke search across new categories**

```bash
node serving/build/ggdd.js search "Tarkov extraction design" | head -c 400
echo
node serving/build/ggdd.js search "Counter-Strike economy" | head -c 400
echo
node serving/build/ggdd.js search "DOOM weapon progression" | head -c 400
```
Expected: each returns top results from the new shooter categories (extraction, competitive, singleplayer respectively).

- [ ] **Step 5: Commit the regenerated corpus**

```bash
git add serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin
git commit -m "feat(serving): regenerate corpus from 24 guides (Plan 7a adds 12 shooter guides)"
```

---

## Task 15: CONTEXT.md + tag

- [ ] **Step 1: Update `CONTEXT.md`**

Replace the `guides/` entry under "Top-level layout":

```
- `guides/` — guide content. 24 guides across 8 categories: `unity-engine` (3), `unity-performance` (3), `game-design-action` (3), `game-design-deckbuilder` (3), `game-design-shooter-survival` (3), `game-design-shooter-extraction` (3), `game-design-shooter-competitive` (3), `game-design-shooter-singleplayer` (3). Plans 7b/7c/7d will add platformer, strategy, soulslike, AI perception, and Unity engine additions (cinemachine, UI Toolkit, Netcode).
```

Append to Active TODOs:

```
- **Shooter base-app skeleton**: `harness/base_apps/shooter-skeleton/` is not yet created. All 12 shooter design guides currently point at `empty-unity6` as their baseApp. Build out a shooter skeleton (basic FPS player + weapon + enemy) when these guides need genuine project context.
```

- [ ] **Step 2: Full preflight**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts' 2>&1 | tail -3
cd serving && node --experimental-strip-types --test --test-timeout 60000 'lib/**/*.test.ts' 'bin/**/*.test.ts' 'mcp-server/**/*.test.ts' 'scripts/**/*.test.ts' 'skills-cli/**/*.test.ts' 2>&1 | tail -3
cd ../harness && node --experimental-strip-types --test --test-timeout 60000 'config.test.ts' 'lib/*.test.ts' 'agents/*.test.ts' 2>&1 | tail -3
cd ../eval-view && npm test 2>&1 | tail -3
cd .. && node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
```

Expected: all green; `All 24 graders calibrated.`

- [ ] **Step 3: Commit + tag**

```bash
git add CONTEXT.md
git commit -m "docs: update CONTEXT.md for Plan 7a (12 shooter guides, 24 total)"
git tag v1.1.0-plan7a
git log --oneline | head -20
```

---

## Plan 7a acceptance checks

- [ ] `find guides -name guide.md | wc -l` → `24`
- [ ] `node bin/ggdd-dev.ts audit` shows all 24 ✓
- [ ] `node bin/ggdd-dev.ts dev-all --test-grader` reports `All 24 graders calibrated.`
- [ ] Search returns shooter-specific top results for shooter queries
- [ ] Tag `v1.1.0-plan7a`

---

## Out of scope (Plans 7b/c/d)

- Plan 7b: platformer (3) + soulslike (1) + AI perception (1) categories = 15 new guides
- Plan 7c: strategy (rts-classic + moba + mmorts) = 9 new guides
- Plan 7d: Unity engine additions (cinemachine, UI Toolkit, Netcode) = 3 new guides
- Shooter skeleton Unity project (tracked TODO)
