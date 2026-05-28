# ggdd Plan 7b — Platformer + Soulslike + AI Perception (15 new guides)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add 5 new categories with 3 guides each = 15 new guides. Brings the corpus from 24 → 39 guides.

- `game-design-platformer-precision` (3): Celeste / Super Meat Boy
- `game-design-platformer-momentum` (3): Sonic / Hollow Knight movement
- `game-design-platformer-3d-collectathon` (3): Mario 64 / Banjo
- `game-design-soulslike` (3): Dark Souls / Bloodborne
- `game-design-ai-perception` (3): stealth + horror + companion AI substrate

**Architecture:** Same per-guide structure Plan 7a established. Schema was already extended in Plan 7a Task 1 to accept these category names — no schema changes needed here.

**Tech Stack:** Same as Plan 7a. Use npm.

**Branch:** `feature/plan-7b-platformer-soulslike-ai` (off `main`, after PR #7 merged).

---

## Task 1: `game-design-platformer-precision/tight-respawn-loop`

**Files:** `guides/game-design-platformer-precision/tight-respawn-loop/{guide.md, expectations.md, tasks/task.md, demo/RespawnSystem.cs, negative-demo/RespawnSystem.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: tight-respawn-loop
category: game-design-platformer-precision
title: Tight respawn loop for precision platformers
description: In a precision platformer (Celeste, Super Meat Boy), death is part of the iteration loop. Keep death-to-respawn under 1 second, checkpoint generously, preserve momentum-context after death.
useCases:
  - "design respawn for precision platformer"
  - "Celeste style instant respawn"
  - "death-to-respawn time tuning"
  - "checkpoint density platformer"
  - "minimize player frustration on death"
relatedGuides: []
appliesTo:
  - "any precision platformer where death is expected and frequent"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Tight respawn loop

In a precision platformer, the player dies hundreds of times per session — that's the gameplay loop. The death-to-respawn cycle must be FAST and FRICTIONLESS, or each death compounds frustration.

Three knobs:
1. **Respawn delay < 1 second**: from death animation start to controllable character at checkpoint.
2. **Checkpoint density**: ideally one per screen / room. Save the player from re-traversing trivial sections.
3. **Preserve attempt context**: keep death count, time elapsed, and run state visible so the player feels iteration, not setback.

## Implementation

```csharp
using UnityEngine;

public class RespawnSystem : MonoBehaviour
{
    [SerializeField] private float respawnDelaySeconds = 0.4f;
    [SerializeField] private Transform currentCheckpoint;
    [SerializeField] private int deathCount = 0;
    [SerializeField] private float runStartedAt;

    public void OnPlayerDeath(Transform player)
    {
        deathCount++;
        Invoke(nameof(RespawnPlayer), respawnDelaySeconds);
    }

    private void RespawnPlayer()
    {
        // Reset to checkpoint, restore controls instantly.
    }

    public void SetCheckpoint(Transform t) { currentCheckpoint = t; }
}
```

## Avoid

- Long death animations (>1s) — kills iteration rhythm.
- Respawn at the start of a level instead of at a checkpoint — punishes the player for not completing in one run.
- Loading screens between deaths — dead time, breaks flow.
- Hiding death count or run timer — players want to see their iteration metrics.

## Gotchas

- "Respawn at checkpoint" doesn't mean teleport instantly — a brief fade-in (~200ms) cushions the visual.
- Checkpoints should be on success milestones (cleared an obstacle), not every few pixels.
- Death animation should be short BUT satisfying — Celeste's wall-crash particles take ~400ms.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: tight-respawn-loop

After applying this guide, the agent's `Assets/Scripts/RespawnSystem.cs` should:

1. Have a `respawnDelaySeconds` serialized field with value ≤ 1.0.
2. Have a `currentCheckpoint` field (Transform reference).
3. Have a `deathCount` serialized integer field.
4. Expose `OnPlayerDeath(Transform)` that increments death count and triggers respawn.
5. Expose `SetCheckpoint(Transform)` to update the active checkpoint.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/RespawnSystem.cs` for a precision platformer. Provide:
- A `respawnDelaySeconds` serialized field (default ~0.4f, must be ≤ 1.0).
- A `currentCheckpoint` Transform field.
- A `deathCount` serialized int field.
- `OnPlayerDeath(Transform player)` that increments deathCount and schedules a respawn after `respawnDelaySeconds`.
- `SetCheckpoint(Transform t)` to update the checkpoint.
```

- [ ] **Step 4: `demo/RespawnSystem.cs`**

```csharp
using UnityEngine;

public class RespawnSystem : MonoBehaviour
{
    [SerializeField] private float respawnDelaySeconds = 0.4f;
    [SerializeField] private Transform currentCheckpoint;
    [SerializeField] private int deathCount = 0;
    [SerializeField] private float runStartedAt;

    public void OnPlayerDeath(Transform player)
    {
        deathCount++;
        Invoke(nameof(RespawnPlayer), respawnDelaySeconds);
    }

    private void RespawnPlayer() { }

    public void SetCheckpoint(Transform t) { currentCheckpoint = t; }
}
```

- [ ] **Step 5: `negative-demo/RespawnSystem.cs`**

```csharp
using UnityEngine;

public class RespawnSystem : MonoBehaviour
{
    [SerializeField] private float respawnDelaySeconds = 3.5f;  // too long

    public void OnPlayerDeath()
    {
        // Reloads the whole scene — long loading screen between deaths.
        UnityEngine.SceneManagement.SceneManager.LoadScene(0);
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
  ?? path.join(import.meta.dirname, 'demo', 'RespawnSystem.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('respawnDelaySeconds default ≤ 1.0', () => {
  const m = codeOnly.match(/respawnDelaySeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected respawnDelaySeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v <= 1.0, `respawnDelaySeconds ${v} > 1.0 — too slow for precision platformer`);
});

test('has Transform currentCheckpoint field', () => {
  assert.ok(hasPattern(codeOnly, /\bTransform\s+currentCheckpoint\b/));
});

test('has deathCount serialized int field', () => {
  assert.ok(hasPattern(codeOnly, /\[SerializeField\][\s\S]*?int\s+deathCount\b/));
});

test('OnPlayerDeath method exists and increments deathCount', () => {
  assert.ok(hasPattern(codeOnly, /\bOnPlayerDeath\s*\(/));
  assert.ok(hasPattern(codeOnly, /deathCount\+\+|deathCount\s*\+=\s*1/));
});

test('SetCheckpoint method exists', () => {
  assert.ok(hasPattern(codeOnly, /\bvoid\s+SetCheckpoint\s*\(\s*Transform/));
});

test('does NOT reload the whole scene on death', () => {
  assert.ok(!/SceneManager\.LoadScene/.test(codeOnly));
});
```

- [ ] **Step 7: Calibrate + commit**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-platformer-precision/tight-respawn-loop/grader.ts 2>&1 | tail -3
TARGET_FILE=$(pwd)/guides/game-design-platformer-precision/tight-respawn-loop/negative-demo/RespawnSystem.cs \
  node --experimental-strip-types --test guides/game-design-platformer-precision/tight-respawn-loop/grader.ts 2>&1 | tail -3
git add guides/game-design-platformer-precision/tight-respawn-loop/
git commit -m "feat(guides): add tight-respawn-loop guide + grader"
```
Expected: demo 6/6; negative-demo fails ≥4.

---

## Task 2: `game-design-platformer-precision/single-mechanic-level-grammar`

**Files:** `guides/game-design-platformer-precision/single-mechanic-level-grammar/{guide.md, expectations.md, tasks/task.md, demo/LevelGrammar.cs, negative-demo/LevelGrammar.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
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
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: single-mechanic-level-grammar

After applying this guide, the agent's `Assets/Scripts/LevelGrammar.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `PlatformerMechanic` enum with at least 5 distinct mechanics.
3. Declare a `LevelSpec` serializable inner class with `levelName`, `knownMechanics` (array), `newMechanicsIntroduced` (array) fields.
4. Have a `levels` array field.
5. Expose `IsValidGrammar()` returning false if any level introduces > 1 new mechanic.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/LevelGrammar.cs` as a ScriptableObject. Provide:
- A `PlatformerMechanic` enum (Walk, Jump, DoubleJump, Dash, WallJump, Crouch, GrappleHook).
- A `LevelSpec` serializable inner class with `levelName`, `knownMechanics` (PlatformerMechanic[]), `newMechanicsIntroduced` (PlatformerMechanic[]).
- A `levels` (LevelSpec[]) field.
- `IsValidGrammar()` returning false if any level's `newMechanicsIntroduced` length > 1.
```

- [ ] **Step 4: `demo/LevelGrammar.cs`**

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
        public PlatformerMechanic[] knownMechanics;
        public PlatformerMechanic[] newMechanicsIntroduced;
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

- [ ] **Step 5: `negative-demo/LevelGrammar.cs`**

```csharp
using UnityEngine;

public enum PlatformerMechanic { Jump }

public class LevelGrammar : MonoBehaviour
{
    public int totalLevels;  // no per-level mechanic tracking
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'LevelGrammar.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('LevelGrammar extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(codeOnly, /LevelGrammar\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(codeOnly, /\[CreateAssetMenu\b/));
});

test('declares PlatformerMechanic enum with ≥5 values', () => {
  assert.ok(declaresType(codeOnly, 'enum', 'PlatformerMechanic'));
  const m = codeOnly.match(/enum\s+PlatformerMechanic\s*\{([^}]+)\}/);
  const values = (m?.[1] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(values.length >= 5, `expected ≥5 mechanics, got ${values.length}`);
});

test('declares LevelSpec serializable inner class with required fields', () => {
  assert.ok(declaresType(codeOnly, 'class', 'LevelSpec'));
  assert.ok(hasPattern(codeOnly, /\[System\.Serializable\]/));
  assert.ok(hasPattern(codeOnly, /\bstring\s+levelName\b/));
  assert.ok(hasPattern(codeOnly, /\bPlatformerMechanic\[\]\s+knownMechanics\b/));
  assert.ok(hasPattern(codeOnly, /\bPlatformerMechanic\[\]\s+newMechanicsIntroduced\b/));
});

test('declares levels array field', () => {
  assert.ok(hasPattern(codeOnly, /\bLevelSpec\[\]\s+levels\b/));
});

test('IsValidGrammar method exists and checks length > 1', () => {
  assert.ok(hasPattern(codeOnly, /\bIsValidGrammar\s*\(/));
  assert.ok(hasPattern(codeOnly, /newMechanicsIntroduced\.Length\s*>\s*1/));
});
```

- [ ] **Step 7: Calibrate + commit**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-platformer-precision/single-mechanic-level-grammar/grader.ts 2>&1 | tail -3
TARGET_FILE=$(pwd)/guides/game-design-platformer-precision/single-mechanic-level-grammar/negative-demo/LevelGrammar.cs \
  node --experimental-strip-types --test guides/game-design-platformer-precision/single-mechanic-level-grammar/grader.ts 2>&1 | tail -3
git add guides/game-design-platformer-precision/single-mechanic-level-grammar/
git commit -m "feat(guides): add single-mechanic-level-grammar guide + grader"
```
Expected: demo 5/5; negative-demo fails ≥4.

---

## Task 3: `game-design-platformer-precision/forgiving-input-windows`

**Files:** `guides/game-design-platformer-precision/forgiving-input-windows/{guide.md, expectations.md, tasks/task.md, demo/JumpTolerances.cs, negative-demo/JumpTolerances.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: forgiving-input-windows
category: game-design-platformer-precision
title: Forgiving input windows (coyote time, jump buffering, variable height)
description: Precision platformers feel fair when the game's input windows accommodate human reaction time variability. Coyote time, jump buffering, and variable jump height are the canonical trio.
useCases:
  - "coyote time for platformer jump"
  - "variable jump height tuning"
  - "platformer feels precise but forgiving"
  - "jump buffering window"
  - "Celeste-style jump feel"
relatedGuides:
  - tight-respawn-loop
appliesTo:
  - "any platformer where the player jumps with intent and timing"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Forgiving input windows

A precision platformer that's actually precise — frame-perfect inputs, no tolerance — feels punishing, not skillful. Three forgiving windows fix this without sacrificing skill expression:

1. **Coyote time** (~100ms): jump button works for a brief window AFTER walking off a ledge. The player thinks "I jumped from the edge," the game treats it as a jump.
2. **Jump buffering** (~150ms): jump button press queues if pressed slightly before landing. Player thinks "I jumped on landing," game accepts the early press.
3. **Variable jump height**: holding jump = full height; tapping = short hop. Lets the player thread tight gaps without overshooting.

## Implementation

```csharp
using UnityEngine;

public class JumpTolerances : MonoBehaviour
{
    [SerializeField] private float coyoteTimeSeconds = 0.10f;
    [SerializeField] private float jumpBufferSeconds = 0.15f;
    [SerializeField] private float fullJumpVelocity = 12f;
    [SerializeField] private float shortHopMultiplier = 0.45f;

    private float lastGroundedAt = -1f;
    private float lastJumpPressedAt = -1f;

    public void OnGrounded() { lastGroundedAt = Time.time; }
    public void OnJumpPressed() { lastJumpPressedAt = Time.time; }

    public bool CanJump()
    {
        bool coyoteOk = Time.time - lastGroundedAt <= coyoteTimeSeconds;
        bool bufferedOk = Time.time - lastJumpPressedAt <= jumpBufferSeconds;
        return coyoteOk && bufferedOk;
    }

    public float ComputeJumpVelocity(bool held)
    {
        return held ? fullJumpVelocity : fullJumpVelocity * shortHopMultiplier;
    }
}
```

## Avoid

- Zero tolerance — frame-perfect inputs feel like a bug, not skill.
- Coyote time > 200ms — feels floaty, players "jump from the void."
- Buffer > 300ms — players' subsequent intentional jumps get auto-eaten by the buffer.
- Variable jump multiplier > 0.7 — short hop becomes pointless; tap and hold feel the same.

## Gotchas

- Coyote and buffer windows interact: a player may have both active simultaneously. Decide which takes precedence (usually buffer, since it represents intent).
- The "release jump = stop ascending" pattern should be implemented as a velocity cut (set vY to vY * shortHopMultiplier on release), not as physics tweaking.
- Frame timing matters: at 60fps, 100ms = 6 frames. At 30fps it's 3 frames. Tune by seconds, not frames.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: forgiving-input-windows

After applying this guide, the agent's `Assets/Scripts/JumpTolerances.cs` should:

1. Have a `coyoteTimeSeconds` serialized field in (0, 0.2].
2. Have a `jumpBufferSeconds` serialized field in (0, 0.3].
3. Have a `fullJumpVelocity` and a `shortHopMultiplier` (the latter in (0, 0.7)).
4. Expose `OnGrounded()` and `OnJumpPressed()` for state tracking.
5. Expose `CanJump()` returning true only when both windows are active.
6. Expose `ComputeJumpVelocity(bool held)` that returns full velocity when held, scaled velocity otherwise.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

Implement `Assets/Scripts/JumpTolerances.cs`. Provide:
- Serialized `coyoteTimeSeconds` (≤0.2), `jumpBufferSeconds` (≤0.3), `fullJumpVelocity`, `shortHopMultiplier` (<0.7).
- `OnGrounded()` and `OnJumpPressed()` updating state timestamps.
- `CanJump()` returning true only when within both coyote and buffer windows.
- `ComputeJumpVelocity(bool held)` returning full or scaled velocity.
```

- [ ] **Step 4: `demo/JumpTolerances.cs`**

```csharp
using UnityEngine;

public class JumpTolerances : MonoBehaviour
{
    [SerializeField] private float coyoteTimeSeconds = 0.10f;
    [SerializeField] private float jumpBufferSeconds = 0.15f;
    [SerializeField] private float fullJumpVelocity = 12f;
    [SerializeField] private float shortHopMultiplier = 0.45f;

    private float lastGroundedAt = -1f;
    private float lastJumpPressedAt = -1f;

    public void OnGrounded() { lastGroundedAt = Time.time; }
    public void OnJumpPressed() { lastJumpPressedAt = Time.time; }

    public bool CanJump()
    {
        bool coyoteOk = Time.time - lastGroundedAt <= coyoteTimeSeconds;
        bool bufferedOk = Time.time - lastJumpPressedAt <= jumpBufferSeconds;
        return coyoteOk && bufferedOk;
    }

    public float ComputeJumpVelocity(bool held)
    {
        return held ? fullJumpVelocity : fullJumpVelocity * shortHopMultiplier;
    }
}
```

- [ ] **Step 5: `negative-demo/JumpTolerances.cs`**

```csharp
using UnityEngine;

public class JumpTolerances : MonoBehaviour
{
    [SerializeField] private float fullJumpVelocity = 12f;
    public float ComputeJumpVelocity() => fullJumpVelocity;  // no variable height
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'JumpTolerances.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('coyoteTimeSeconds in (0, 0.2]', () => {
  const m = codeOnly.match(/coyoteTimeSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected coyoteTimeSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 0.2, `coyoteTimeSeconds ${v} not in (0, 0.2]`);
});

test('jumpBufferSeconds in (0, 0.3]', () => {
  const m = codeOnly.match(/jumpBufferSeconds\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected jumpBufferSeconds literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v <= 0.3, `jumpBufferSeconds ${v} not in (0, 0.3]`);
});

test('shortHopMultiplier in (0, 0.7)', () => {
  const m = codeOnly.match(/shortHopMultiplier\s*=\s*(\d+(?:\.\d+)?)f?/);
  assert.ok(m, 'expected shortHopMultiplier literal');
  const v = parseFloat(m![1]);
  assert.ok(v > 0 && v < 0.7, `shortHopMultiplier ${v} not in (0, 0.7)`);
});

test('OnGrounded and OnJumpPressed methods exist', () => {
  assert.ok(hasPattern(codeOnly, /\bOnGrounded\s*\(/));
  assert.ok(hasPattern(codeOnly, /\bOnJumpPressed\s*\(/));
});

test('CanJump checks both coyote and buffer windows', () => {
  assert.ok(hasPattern(codeOnly, /\bCanJump\s*\(/));
  assert.ok(hasPattern(codeOnly, /lastGroundedAt/));
  assert.ok(hasPattern(codeOnly, /lastJumpPressedAt/));
});

test('ComputeJumpVelocity takes a bool parameter (held)', () => {
  assert.ok(hasPattern(codeOnly, /\bComputeJumpVelocity\s*\(\s*bool\s+\w+\s*\)/));
});
```

- [ ] **Step 7: Calibrate + commit**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-platformer-precision/forgiving-input-windows/grader.ts 2>&1 | tail -3
TARGET_FILE=$(pwd)/guides/game-design-platformer-precision/forgiving-input-windows/negative-demo/JumpTolerances.cs \
  node --experimental-strip-types --test guides/game-design-platformer-precision/forgiving-input-windows/grader.ts 2>&1 | tail -3
git add guides/game-design-platformer-precision/forgiving-input-windows/
git commit -m "feat(guides): add forgiving-input-windows guide + grader"
```
Expected: demo 6/6; negative-demo fails ≥5.

---

## Tasks 4-15 follow the same pattern

Due to space, the remaining 12 tasks are described compactly. Each follows: write 6 files, calibrate, commit with `feat(guides): add <id> guide + grader`. Each implementer subagent should use the same file template as Tasks 1-3.

### Task 4: `game-design-platformer-momentum/momentum-preservation-transitions`

Concept: when a player transitions between movement states (ground→air, walljump→air, slope→jump, dash→ground), preserve their accumulated horizontal velocity. Punishing transitions kills flow.

Demo class `MomentumTransitions.cs`:
- Serialized `preserveHorizontalOnLand = true`, `slopeMomentumGain = 1.2f`, `wallJumpHorizontalRetention = 0.85f`.
- Methods: `ProjectLandingVelocity(Vector2 air)` returning a velocity that preserves horizontal component; `WallJumpVelocity(Vector2 fromWall, Vector2 currentVel)` retaining a fraction.

Grader checks: serialized retention fields present, retention values in (0, 1], `ProjectLandingVelocity` returns Vector2.

### Task 5: `game-design-platformer-momentum/level-as-race-track`

Concept: levels have parallel paths at different skill tiers (Sonic loops you can either run through casually or rocket through with momentum). Optimal route is faster; safe route is survivable.

Demo class `LevelRoute.cs`:
- `RoutePath` serializable inner class with `pathName`, `requiredSpeed`, `riskLevel`, `estimatedSeconds`.
- `paths` array; `OptimalPathSeconds()` returns shortest.

Grader checks: multiple paths (≥2), each path has speed/risk/estimated fields, optimal returns shortest.

### Task 6: `game-design-platformer-momentum/anticipatory-camera`

Concept: when player moves fast, frame the camera AHEAD of them so they see what's coming. Center-locked camera kills momentum gameplay.

Demo class `AnticipatoryCamera.cs`:
- `leadDistance = 3f`, `maxLeadDistance = 6f`, `leadAtSpeed = 8f`.
- `ComputeOffset(Vector2 playerVelocity)` returns an offset proportional to velocity, capped at maxLead.

Grader checks: lead serialized fields, offset method takes Vector2 velocity, uses Mathf.Clamp.

### Task 7: `game-design-platformer-3d-collectathon/collectible-density-clumping`

Concept: collectibles (coins, jiggies) should be clumped into "this is the thing here" beats rather than evenly scattered. Room-scale density matters more than world-scale.

Demo class `CollectibleLayout.cs`:
- `CollectibleClump` serializable: `roomName`, `count`, `requiresAbility`.
- `clumps` array; `TotalCollectibles()`, `IsRoomEmpty(string)`.

Grader checks: clump structure, count per clump > 1, methods exist.

### Task 8: `game-design-platformer-3d-collectathon/non-fighting-camera`

Concept: orbit camera with auto-reframe. Never wrestle control from the player. Use Cinemachine 3.

Demo class `CollectathonCamera.cs`:
- `orbitDistance = 5f`, `autoFrameEnabled = true`, `manualOverridePriority` (when player rotates camera, manual wins).
- `ShouldYieldToPlayer(bool isPlayerInputtingCamera)` returns true if player is actively controlling.

Grader checks: orbit serialized fields, `ShouldYieldToPlayer` method, references CinemachineCamera or similar.

### Task 9: `game-design-platformer-3d-collectathon/hub-and-spoke-world`

Concept: central hub world acts as save point + level select. Sub-worlds have internal arcs. Backtracking to earlier worlds with new abilities (Metroidvania-light).

Demo class `WorldStructure.cs`:
- `SubWorld` serializable: `worldName`, `unlockedByAbility`, `internalCollectibles`.
- `hub` field of type `SubWorld` (the hub itself); `subWorlds` array.
- `CanAccess(SubWorld, PlayerAbility[])` returns true if player has the prerequisite.

Grader checks: hub + subWorlds fields, CanAccess method, ability-gating present.

### Task 10: `game-design-soulslike/stamina-economy`

Concept: every action costs stamina; running out leaves you exposed. Tune regen carefully so it's punishing but not crippling.

Demo class `StaminaSystem.cs`:
- `maxStamina = 100f`, `regenPerSecond = 30f`, `regenDelayAfterUseSeconds = 0.6f`.
- `currentStamina`, `lastStaminaUseAt`.
- `TryConsume(float amount)` returns false if insufficient; `Update()` regens after delay.

Grader checks: serialized stamina fields, regenDelay > 0, TryConsume returns bool, doesn't allow negative stamina.

### Task 11: `game-design-soulslike/readable-attack-telegraphs`

Concept: every enemy attack should be readable in 0.5-1s. Punish the player for missing the read, not for the read taking too long.

Demo class `EnemyAttackTelegraph.cs`:
- `windupSeconds = 0.7f`, `recoverySeconds = 0.4f`, `staggerWindowSeconds = 0.3f`.
- `StartTelegraph()`, `IsAttacking()`, `IsInStaggerWindow()`.

Grader checks: windup in [0.5, 1.2], recovery > 0, stagger window between [0.1, 0.5].

### Task 12: `game-design-soulslike/bonfire-shortcut-design`

Concept: checkpoints (bonfires) rare; shortcuts reward exploration by reducing travel cost to recently-cleared content.

Demo class `BonfireShortcut.cs`:
- `Bonfire` serializable: `name`, `unlockShortcuts` (string[] of shortcut IDs).
- `bonfires` array; `Shortcut` class with `fromBonfireId`, `toBonfireId`, `oneWayOrTwoWay`.
- `IsUnlockedShortcut(string)` lookup.

Grader checks: bonfires + shortcuts, lookup method.

### Task 13: `game-design-ai-perception/cone-of-vision-falloff`

Concept: AI visibility falls off with distance, light level, and target motion. Linear-falloff is unrealistic; use combined terms.

Demo class `VisionCone.cs`:
- `visionRangeMeters = 20f`, `coneAngleDegrees = 90f`, `lightThreshold = 0.3f`, `motionVisibilityBoost = 1.5f`.
- `CanSee(Vector3 targetPos, float targetLightLevel, float targetSpeed)` returns bool.

Grader checks: serialized vision fields, CanSee takes 3 args, uses Vector3.Distance + Vector3.Angle.

### Task 14: `game-design-ai-perception/alert-state-machine-hysteresis`

Concept: AI alert states (unaware → suspicious → alert → searching → patrol) don't oscillate. Hysteresis prevents flickering between states.

Demo class `AlertState.cs`:
- `AlertLevel` enum (Unaware, Suspicious, Alert, Searching, Patrol).
- `currentLevel`, `lastTransitionAt`, `transitionCooldownSeconds = 0.5f`.
- `TransitionTo(AlertLevel)` checks hysteresis.

Grader checks: enum has 5 levels, transitionCooldown serialized field > 0, TransitionTo uses Time.time.

### Task 15: `game-design-ai-perception/sound-propagation-attenuated`

Concept: sound propagates through walls (attenuated) so AI investigates source. Independent of line-of-sight.

Demo class `SoundPropagation.cs`:
- `maxHearingRangeMeters = 30f`, `wallAttenuationDb = 12f`.
- `IsAudible(Vector3 source, Vector3 listener, int wallsBetween)` returns bool based on attenuated distance.

Grader checks: hearing range field, attenuation field, IsAudible takes 3 args (including walls), uses Mathf.

---

## Per-task implementation guidance (Tasks 4-15)

For each of Tasks 4-15, the implementer should:

1. Write the 6 files per the concept descriptions above.
2. Use Plan 7a's templates as reference for guide.md/expectations.md/tasks/task.md format.
3. Demo files: realistic Unity 6 C# matching the demo class outline.
4. Negative-demo files: a stripped-down anti-pattern (no serialized fields, no methods, MonoBehaviour without ScriptableObject, etc.).
5. Grader: 5-7 assertions checking serialized fields, value ranges where given, method signatures. Use `codeOnly` comment-stripping.
6. Calibrate: demo passes all; negative-demo fails ≥3.
7. Commit per file with the canonical `feat(guides): add <id> guide + grader` message.

---

## Task 16: Refresh corpus + final preflight + tag

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types scripts/build-guides.ts
node --experimental-strip-types skills-cli/build-dist.ts
cd ..
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
node --experimental-strip-types --test 'lib/**/*.test.ts' 'guides/**/*.test.ts' 2>&1 | tail -3
```
Expected: `All 39 graders calibrated.`

Update `CONTEXT.md`:

Replace guides/ entry:
```
- `guides/` — guide content. 39 guides across 13 categories. Plan 7c (strategy: rts-classic, moba, mmorts) and Plan 7d (Unity engine: cinemachine, UI Toolkit, Netcode) will round out to 48 guides across 16 categories.
```

Add to TODOs (if not already):
```
- **Platformer / soulslike / AI base-app skeletons**: all Plan 7b guides currently point at `empty-unity6`. Build out genre-specific skeletons when guides need real project context.
```

```bash
git add serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin CONTEXT.md
git commit -m "feat(serving): regenerate corpus from 39 guides (Plan 7b adds 15)"
git tag v1.2.0-plan7b
```

---

## Plan 7b acceptance

- [ ] `find guides -name guide.md | wc -l` → `39`
- [ ] `ggdd-dev dev-all --test-grader` reports `All 39 graders calibrated.`
- [ ] Tag `v1.2.0-plan7b`
