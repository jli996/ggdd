# ggdd Plan 2 — Content Seed (12 guides + shared static test fixture)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the corpus from 1 seed guide to 12 fully-realized guides (3 per category) with per-guide artifacts (guide / expectations / demo / negative-demo / task / grader), plus the shared static-analysis test fixture that all graders use.

**Architecture:** Each guide is a self-contained directory under `guides/<category>/<id>/` with markdown + C# artifacts + a `grader.ts` that uses `guides/test-fixture.ts` helpers (static-only in this plan — Unity batch helpers land in Plan 4 with the harness). After all guides are written, regenerate the serving corpus (`use-cases.gen.ts` + `embeddings.gen.bin`) so search/retrieve cover the full set.

**Tech Stack:** Node 22+ + `node --experimental-strip-types`, `node:test` for graders, `tree-sitter` + `tree-sitter-c-sharp` for C# AST analysis (regex fallback when tree-sitter isn't installable on a platform), the corpus tooling shipped in Plan 1.

**Branch:** `feature/plan-2-content-seed` (off `main`, after PR #1 merged at `d122a4e`).

---

## File map

Created or modified in this plan:

```
/Users/lijinglue/repo/ggdd/
├── package.json                                              # MODIFY (add tree-sitter deps)
├── guides/
│   ├── test-fixture.ts                                       # NEW
│   ├── test-fixture.test.ts                                  # NEW
│   ├── unity-engine/
│   │   ├── new-input-system-basics/
│   │   │   ├── expectations.md                               # MODIFY (rewrite v2)
│   │   │   ├── tasks/task.md                                 # exists
│   │   │   ├── demo/PlayerController.cs                      # NEW
│   │   │   ├── negative-demo/PlayerController.cs             # NEW
│   │   │   └── grader.ts                                     # NEW
│   │   ├── addressables-load-async/                          # NEW dir
│   │   │   ├── guide.md, expectations.md, tasks/task.md
│   │   │   ├── demo/AssetLoader.cs
│   │   │   ├── negative-demo/AssetLoader.cs
│   │   │   └── grader.ts
│   │   └── scriptableobject-shared-state/                    # NEW dir (same file set)
│   ├── unity-performance/                                    # NEW dir
│   │   ├── gc-free-update-loop/{...same set}
│   │   ├── object-pooling-basics/{...same set}
│   │   └── urp-srp-batcher-friendly-materials/{...same set}
│   ├── game-design-action/                                   # NEW dir
│   │   ├── hit-stop-on-impact/{...same set}
│   │   ├── input-buffering/{...same set}
│   │   └── knockback-with-control-takeback/{...same set}
│   └── game-design-deckbuilder/                              # NEW dir
│       ├── run-pacing-3-act-structure/{...same set}
│       ├── card-rarity-without-power-creep/{...same set}
│       └── relic-stacking-readability/{...same set}
├── serving/
│   ├── lib/
│   │   ├── search.ts                                         # MODIFY (similarity threshold)
│   │   ├── search.test.ts                                    # MODIFY (threshold tests)
│   │   ├── use-cases.gen.ts                                  # REGEN (corpus refresh)
│   │   └── embeddings.gen.bin                                # REGEN
└── CONTEXT.md                                                # MODIFY (content scope note)
```

Each new guide directory has exactly 6 files: `guide.md`, `expectations.md`, `tasks/task.md`, `demo/<Component>.cs`, `negative-demo/<Component>.cs`, `grader.ts`.

---

## Task 1: Shared static test fixture (`guides/test-fixture.ts`)

**Files:**
- Modify: `package.json` (add tree-sitter deps)
- Create: `guides/test-fixture.ts`
- Create: `guides/test-fixture.test.ts`

Static C# analysis helpers that every grader will use. Tree-sitter parses C# into an AST for accurate method/type lookups; regex is the fallback when tree-sitter fails to load on a platform.

- [ ] **Step 1: Add tree-sitter deps**

Run:
```bash
cd /Users/lijinglue/repo/ggdd
npm install --ignore-scripts --no-audit --no-fund --save-dev \
  tree-sitter@^0.21.1 tree-sitter-c-sharp@^0.21.3
```
Expected: `package.json` updated, `package-lock.json` updated. (Use npm not pnpm — see CONTEXT.md.)

- [ ] **Step 2: Write failing tests**

`guides/test-fixture.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  readCSharp,
  hasPattern,
  hasNoPattern,
  usesNamespace,
  declaresType,
  methodCallsAst,
  serializedAssetField,
} from './test-fixture.ts';

function withTempCSharp(src: string, run: (filePath: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tfx-'));
  const p = path.join(dir, 'Test.cs');
  fs.writeFileSync(p, src);
  try { run(p); } finally { fs.rmSync(dir, { recursive: true }); }
}

const PLAYER_SRC = `using UnityEngine;
using UnityEngine.InputSystem;

namespace Game {
  public class PlayerController : MonoBehaviour {
    void Update() {
      var move = action.ReadValue<Vector2>();
      DoMove(move);
    }
    void DoMove(Vector2 v) {}
  }
}
`;

test('readCSharp returns the file contents', () => {
  withTempCSharp(PLAYER_SRC, (p) => {
    assert.match(readCSharp(p), /class PlayerController/);
  });
});

test('hasPattern / hasNoPattern detect substrings', () => {
  assert.ok(hasPattern(PLAYER_SRC, /ReadValue<Vector2>/));
  assert.ok(hasNoPattern(PLAYER_SRC, /Input\.GetAxis/));
});

test('usesNamespace detects "using X.Y" imports', () => {
  assert.ok(usesNamespace(PLAYER_SRC, 'UnityEngine.InputSystem'));
  assert.ok(!usesNamespace(PLAYER_SRC, 'System.Linq'));
});

test('declaresType finds class declarations', () => {
  assert.ok(declaresType(PLAYER_SRC, 'class', 'PlayerController'));
  assert.ok(!declaresType(PLAYER_SRC, 'class', 'Missing'));
});

test('methodCallsAst returns call count for a named method', () => {
  // Either tree-sitter or regex fallback should find DoMove called once.
  const r = methodCallsAst(PLAYER_SRC, 'DoMove');
  assert.ok(r.count >= 1, `expected DoMove call count >= 1, got ${r.count}`);
});

test('serializedAssetField reads top-level fields from a Unity YAML asset', () => {
  const yaml = `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!114 &11400000
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_Script: {fileID: 123, guid: abc}
  m_Name: SomeAsset
  m_EditorClassIdentifier:
  cardCost: 3
`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-'));
  const p = path.join(dir, 'Card.asset');
  fs.writeFileSync(p, yaml);
  try {
    assert.equal(serializedAssetField(p, 'MonoBehaviour.cardCost'), 3);
    assert.equal(serializedAssetField(p, 'MonoBehaviour.m_Name'), 'SomeAsset');
  } finally {
    fs.rmSync(dir, { recursive: true });
  }
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --experimental-strip-types --test guides/test-fixture.test.ts`
Expected: FAIL — `Cannot find module './test-fixture.ts'`.

- [ ] **Step 4: Implement `test-fixture.ts`**

`guides/test-fixture.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

/** Reads a C# source file. Resolves relative paths against the test's CWD (Node test runner sets cwd to the grader's directory). */
export function readCSharp(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), 'utf8');
}

export function hasPattern(src: string, pattern: RegExp): boolean {
  return pattern.test(src);
}

export function hasNoPattern(src: string, pattern: RegExp): boolean {
  return !pattern.test(src);
}

/** Detects `using Namespace.Path;` (with optional whitespace). */
export function usesNamespace(src: string, ns: string): boolean {
  const escaped = ns.replace(/\./g, '\\.');
  return new RegExp(`\\busing\\s+${escaped}\\s*;`).test(src);
}

/** Detects `class Foo`, `struct Foo`, or `enum Foo` declarations. */
export function declaresType(src: string, kind: 'class' | 'struct' | 'enum', name: string): boolean {
  return new RegExp(`\\b${kind}\\s+${name}\\b`).test(src);
}

export interface AstSite {
  /** Approximate body source for the enclosing block, if available. Fallback: empty string. */
  body: string;
}

export interface MethodCallsResult {
  count: number;
  sites: AstSite[];
}

let _csharpParser: any = null;
function loadCSharpParser(): any | null {
  if (_csharpParser !== null) return _csharpParser;
  try {
    // Lazy require so missing tree-sitter on a platform doesn't crash other helpers.
    const Parser = require('tree-sitter');
    const CSharp = require('tree-sitter-c-sharp');
    const p = new Parser();
    p.setLanguage(CSharp);
    _csharpParser = p;
    return p;
  } catch {
    _csharpParser = false;
    return null;
  }
}

/**
 * Counts call sites of `methodName(...)` in the source. Uses tree-sitter AST when
 * available; falls back to a regex that matches `methodName(` not preceded by `.` or `:`
 * (a coarse approximation for top-level calls).
 */
export function methodCallsAst(src: string, methodName: string): MethodCallsResult {
  const parser = loadCSharpParser();
  if (parser) {
    const tree = parser.parse(src);
    const sites: AstSite[] = [];
    function walk(node: any) {
      if (node.type === 'invocation_expression') {
        const fn = node.childForFieldName?.('function');
        const text = fn?.text ?? node.firstChild?.text ?? '';
        // Match `name(...)` or `obj.name(...)`.
        if (text === methodName || text.endsWith('.' + methodName)) {
          sites.push({ body: '' });
        }
      }
      for (let i = 0; i < node.childCount; i++) walk(node.child(i));
    }
    walk(tree.rootNode);
    return { count: sites.length, sites };
  }
  // Regex fallback. Skips dotted member access (still catches `foo.bar(` once for `bar`, which is acceptable for our use).
  const matches = src.match(new RegExp(`\\b${methodName}\\s*\\(`, 'g')) ?? [];
  return { count: matches.length, sites: matches.map(() => ({ body: '' })) };
}

/**
 * Reads a top-level numeric/string field from a Unity YAML asset (`.asset`, `.prefab`).
 * Dotted path is interpreted as YAML mapping descent (e.g. `MonoBehaviour.cardCost`).
 * Returns `undefined` if not found. Numbers are returned as `number`, strings as `string`.
 */
export function serializedAssetField(unityAssetPath: string, fieldPath: string): unknown {
  const text = fs.readFileSync(path.resolve(unityAssetPath), 'utf8');
  const parts = fieldPath.split('.');
  const lines = text.split(/\r?\n/);
  // Find the top-level key (e.g. "MonoBehaviour:")
  let idx = lines.findIndex(l => l.startsWith(`${parts[0]}:`));
  if (idx < 0) return undefined;

  // From here, scan child fields (lines starting with "  " indent) until we exit the mapping.
  let currentIndent = 2;
  let target = parts.slice(1).join('.');
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith(' ')) break;
    const m = line.match(/^(\s+)([^:]+):\s*(.*)$/);
    if (!m) continue;
    const [, indent, key, rest] = m;
    if (indent.length !== currentIndent) continue;
    if (key.trim() === target) {
      const value = rest.trim();
      if (value === '') return null;
      const asNum = Number(value);
      return Number.isNaN(asNum) ? value : asNum;
    }
  }
  return undefined;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --experimental-strip-types --test guides/test-fixture.test.ts`
Expected: PASS — 6 tests green. (If tree-sitter fails to load on your platform, `methodCallsAst` still works via regex fallback — the test only asserts count >= 1.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json guides/test-fixture.ts guides/test-fixture.test.ts
git commit -m "feat(guides): add static C# analysis test fixture (regex + optional tree-sitter)"
```

---

## Task 2: Search similarity threshold

**Files:**
- Modify: `serving/lib/search.ts`
- Modify: `serving/lib/search.test.ts`

A Plan 1 PR follow-up: with the corpus growing from 1 to 12 guides, queries with no semantic match still return the top-scored guide (often with negative similarity). Add a `minSimilarity` parameter (default `0.1`) that filters those out so agents see an empty array for irrelevant queries.

- [ ] **Step 1: Add failing tests**

Append to `serving/lib/search.test.ts`:

```typescript
test('search filters out results below the default similarity threshold', async () => {
  const results = await searchUseCases('photosynthesis chlorophyll plant biology');
  assert.equal(results.length, 0, `expected no results for irrelevant query, got ${JSON.stringify(results)}`);
});

test('search accepts an explicit minSimilarity below 0 to include negatives', async () => {
  const results = await searchUseCases('photosynthesis chlorophyll plant biology', 10, -1);
  assert.ok(results.length >= 1, 'expected at least one result with no threshold');
});

test('search default minSimilarity does not filter relevant queries', async () => {
  const results = await searchUseCases('keyboard input in Unity');
  assert.ok(results.length >= 1);
  assert.equal(results[0].id, 'new-input-system-basics');
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `cd serving && node --experimental-strip-types --test lib/search.test.ts --test-timeout 60000`
Expected: the "filters out" test fails (returns the existing weak match instead of empty), the "explicit minSimilarity" test passes signature-error (extra arg ignored).

- [ ] **Step 3: Update `serving/lib/search.ts` signature**

Replace the existing `searchUseCases` function signature and the dedup loop with this version:

```typescript
export async function searchUseCases(
  query: string,
  limit = 10,
  minSimilarity = 0.1,
): Promise<SearchResult[]> {
  if (USE_CASES.length === 0) return [];
  const vectors = loadCorpusVectors();
  const queryVec = await embedder.embed(query);

  const scored = USE_CASES.map(uc => ({
    id: uc.id,
    category: uc.category,
    useCase: uc.useCase,
    description: uc.description,
    similarity: dot(queryVec, vectors[uc.embeddingIndex]),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const r of scored) {
    if (r.similarity < minSimilarity) break;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    deduped.push(r);
    if (deduped.length >= limit) break;
  }
  return deduped;
}
```

The `break` (not `continue`) when below threshold is correct because results are already sorted descending — once one falls below threshold, all subsequent do too.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd serving && node --experimental-strip-types --test lib/search.test.ts --test-timeout 60000`
Expected: PASS — all tests green (original 5 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add serving/lib/search.ts serving/lib/search.test.ts
git commit -m "feat(serving): add minSimilarity threshold (default 0.1) to filter irrelevant results"
```

---

## Task 3: Upgrade `new-input-system-basics` with demo / negative-demo / grader

**Files:**
- Modify: `guides/unity-engine/new-input-system-basics/expectations.md`
- Create: `guides/unity-engine/new-input-system-basics/demo/PlayerController.cs`
- Create: `guides/unity-engine/new-input-system-basics/negative-demo/PlayerController.cs`
- Create: `guides/unity-engine/new-input-system-basics/grader.ts`

The Plan 1 seed has guide.md + expectations.md + tasks/task.md. Add the per-guide artifacts that make it gradable.

- [ ] **Step 1: Replace `expectations.md` with the gradable v2**

`guides/unity-engine/new-input-system-basics/expectations.md`:

```markdown
# Expectations: new-input-system-basics

After applying this guide, the agent's modified `Assets/Scripts/PlayerController.cs` should:

1. Import `UnityEngine.InputSystem` (`using UnityEngine.InputSystem;`).
2. Declare an `InputActionAsset` (or `InputAction`) serialized field.
3. Read movement via `action.ReadValue<Vector2>()` (or `subscribe to action.performed`).
4. Contain NO references to `UnityEngine.Input.GetAxis`, `Input.GetKey`, `Input.GetButton`, or `Input.GetMouseButton`.
5. Not import `System.Linq` (not needed for input handling; signals over-import).
6. Still declare a `PlayerController` class extending `MonoBehaviour`.
```

- [ ] **Step 2: Create `demo/PlayerController.cs`**

`guides/unity-engine/new-input-system-basics/demo/PlayerController.cs`:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private InputActionAsset inputActions;
    private InputAction moveAction;

    void OnEnable()
    {
        moveAction = inputActions.FindActionMap("Player").FindAction("Move");
        moveAction.Enable();
    }

    void OnDisable() => moveAction.Disable();

    void Update()
    {
        Vector2 move = moveAction.ReadValue<Vector2>();
        transform.Translate(new Vector3(move.x, 0f, move.y) * Time.deltaTime);
    }
}
```

- [ ] **Step 3: Create `negative-demo/PlayerController.cs`**

`guides/unity-engine/new-input-system-basics/negative-demo/PlayerController.cs`:

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    void Update()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        transform.Translate(new Vector3(h, 0f, v) * Time.deltaTime);
        if (Input.GetKey(KeyCode.Space)) Jump();
    }

    void Jump() {}
}
```

- [ ] **Step 4: Create `grader.ts`**

`guides/unity-engine/new-input-system-basics/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import {
  readCSharp, usesNamespace, hasPattern, hasNoPattern, declaresType,
} from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PlayerController.cs');
const src = readCSharp(TARGET);

test('imports UnityEngine.InputSystem', () => {
  assert.ok(usesNamespace(src, 'UnityEngine.InputSystem'));
});

test('declares a serialized InputActionAsset or InputAction', () => {
  assert.ok(hasPattern(src, /\b(InputActionAsset|InputAction)\b/));
});

test('reads via ReadValue<...>() or action.performed', () => {
  assert.ok(hasPattern(src, /\.ReadValue<\w+>\(\)|action\.performed/));
});

test('no legacy Input.GetAxis / GetKey / GetButton / GetMouseButton calls', () => {
  assert.ok(hasNoPattern(src, /\bInput\.GetAxis\b/));
  assert.ok(hasNoPattern(src, /\bInput\.GetKey\b/));
  assert.ok(hasNoPattern(src, /\bInput\.GetButton\b/));
  assert.ok(hasNoPattern(src, /\bInput\.GetMouseButton\b/));
});

test('no System.Linq import', () => {
  assert.ok(hasNoPattern(src, /\busing\s+System\.Linq\s*;/));
});

test('declares PlayerController : MonoBehaviour', () => {
  assert.ok(declaresType(src, 'class', 'PlayerController'));
  assert.ok(hasPattern(src, /PlayerController\s*:\s*MonoBehaviour/));
});
```

- [ ] **Step 5: Manually verify the grader calibrates correctly**

Run against the demo (should pass all 6 tests):
```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-engine/new-input-system-basics/grader.ts
```
Expected: 6 pass / 0 fail.

Run against the negative-demo (should fail several):
```bash
TARGET_FILE=$(pwd)/guides/unity-engine/new-input-system-basics/negative-demo/PlayerController.cs \
  node --experimental-strip-types --test guides/unity-engine/new-input-system-basics/grader.ts
```
Expected: at least 3 failures (no InputSystem import, no ReadValue, has Input.GetAxis/GetKey).

If both behave as expected, the grader is calibrated.

- [ ] **Step 6: Commit**

```bash
git add guides/unity-engine/new-input-system-basics/
git commit -m "feat(guides): upgrade new-input-system-basics with demo/negative-demo/grader"
```

---

## Task 4: `addressables-load-async`

**Files:**
- Create: `guides/unity-engine/addressables-load-async/guide.md`
- Create: `guides/unity-engine/addressables-load-async/expectations.md`
- Create: `guides/unity-engine/addressables-load-async/tasks/task.md`
- Create: `guides/unity-engine/addressables-load-async/demo/AssetLoader.cs`
- Create: `guides/unity-engine/addressables-load-async/negative-demo/AssetLoader.cs`
- Create: `guides/unity-engine/addressables-load-async/grader.ts`

- [ ] **Step 1: Create `guide.md`**

`guides/unity-engine/addressables-load-async/guide.md`:

```markdown
---
id: addressables-load-async
category: unity-engine
title: Load assets asynchronously via Addressables (Unity 6)
description: Use the Addressables package's async APIs (LoadAssetAsync, InstantiateAsync) to load and instantiate prefabs and assets without blocking the main thread.
useCases:
  - "load a prefab at runtime in Unity"
  - "instantiate an asset asynchronously in Unity"
  - "replace Resources.Load with modern asset loading"
  - "stream assets without freezing the frame"
  - "manage asset memory with addressables"
relatedGuides: []
appliesTo:
  - "any script that loads prefabs, textures, or audio at runtime"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Load assets asynchronously via Addressables

Unity 6's recommended asset loading API is the [Addressables](https://docs.unity3d.com/Packages/com.unity.addressables@2.0/manual/index.html) package. It replaces `Resources.Load`, direct `AssetBundle` access, and synchronous instantiation patterns with async, reference-counted operations that stream data without blocking the main thread.

## Use Addressables async APIs

```csharp
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private AssetReferenceGameObject enemyRef;
    private AsyncOperationHandle<GameObject> handle;

    async void Start()
    {
        handle = enemyRef.InstantiateAsync(transform.position, Quaternion.identity);
        await handle.Task;
        var enemy = handle.Result;
        // configure spawned instance
    }

    void OnDestroy()
    {
        if (handle.IsValid()) Addressables.ReleaseInstance(handle);
    }
}
```

## Avoid

- `Resources.Load` / `Resources.LoadAsync` — the `Resources/` folder is loaded eagerly at build time, balloons memory, and isn't trimmed by build pipeline tree-shaking.
- Direct `AssetBundle` API — Addressables wraps bundles with reference counting and content catalogs.
- Synchronous `Instantiate(prefab)` on a fresh asset reference — that stalls the frame.

## Gotchas

- Always `Addressables.Release()` / `Addressables.ReleaseInstance()` what you instantiate. Leaks accumulate.
- `AssetReference` is checked at edit-time; `string` keys aren't — prefer typed references.
- Awaiting `handle.Task` is the modern pattern; `handle.Completed += ...` callbacks still work but are noisier.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/unity-engine/addressables-load-async/expectations.md`:

```markdown
# Expectations: addressables-load-async

After applying this guide, the agent's modified `Assets/Scripts/AssetLoader.cs` should:

1. Import `UnityEngine.AddressableAssets`.
2. Use `AssetReference`, `AssetReferenceGameObject`, or `Addressables.LoadAssetAsync<T>` / `InstantiateAsync` for loading.
3. Either `await handle.Task` or subscribe to `handle.Completed`.
4. Not call `Resources.Load`, `Resources.LoadAsync`, or `AssetBundle.LoadFromFile/LoadAsset`.
5. Release the handle (`Addressables.Release` or `Addressables.ReleaseInstance`) when done with the instance.
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/unity-engine/addressables-load-async/tasks/task.md`:

```markdown
# Task

`Assets/Scripts/AssetLoader.cs` currently loads an enemy prefab synchronously via `Resources.Load<GameObject>("Enemy")` and `Instantiate`. Refactor it to load via the Addressables package using `AssetReferenceGameObject` (serialized field named `enemyRef`) and `InstantiateAsync` awaited in `Start`. Release the handle in `OnDestroy`.
```

- [ ] **Step 4: Create `demo/AssetLoader.cs`**

`guides/unity-engine/addressables-load-async/demo/AssetLoader.cs`:

```csharp
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class AssetLoader : MonoBehaviour
{
    [SerializeField] private AssetReferenceGameObject enemyRef;
    private AsyncOperationHandle<GameObject> handle;

    async void Start()
    {
        handle = enemyRef.InstantiateAsync(transform.position, Quaternion.identity);
        await handle.Task;
    }

    void OnDestroy()
    {
        if (handle.IsValid()) Addressables.ReleaseInstance(handle);
    }
}
```

- [ ] **Step 5: Create `negative-demo/AssetLoader.cs`**

`guides/unity-engine/addressables-load-async/negative-demo/AssetLoader.cs`:

```csharp
using UnityEngine;

public class AssetLoader : MonoBehaviour
{
    void Start()
    {
        var prefab = Resources.Load<GameObject>("Enemy");
        Instantiate(prefab, transform.position, Quaternion.identity);
    }
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/unity-engine/addressables-load-async/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, usesNamespace, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'AssetLoader.cs');
const src = readCSharp(TARGET);

test('imports UnityEngine.AddressableAssets', () => {
  assert.ok(usesNamespace(src, 'UnityEngine.AddressableAssets'));
});

test('uses async loading API (LoadAssetAsync / InstantiateAsync / AssetReference)', () => {
  assert.ok(hasPattern(src, /\b(LoadAssetAsync|InstantiateAsync|AssetReference\w*)\b/));
});

test('awaits the handle or registers a Completed callback', () => {
  assert.ok(hasPattern(src, /\bawait\s+\w+\.Task\b|\.Completed\s*\+=/));
});

test('does not call Resources.Load / LoadAsync', () => {
  assert.ok(hasNoPattern(src, /\bResources\.(Load|LoadAsync|LoadAll)\s*[<(]/));
});

test('does not call AssetBundle.LoadFromFile or LoadAsset', () => {
  assert.ok(hasNoPattern(src, /\bAssetBundle\.(LoadFromFile|LoadAsset)\s*[<(]/));
});

test('releases the handle (Addressables.Release / ReleaseInstance)', () => {
  assert.ok(hasPattern(src, /\bAddressables\.(Release|ReleaseInstance)\b/));
});
```

- [ ] **Step 7: Calibrate the grader**

Run:
```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-engine/addressables-load-async/grader.ts
```
Expected: 6 pass / 0 fail against demo.

Run against negative-demo:
```bash
TARGET_FILE=$(pwd)/guides/unity-engine/addressables-load-async/negative-demo/AssetLoader.cs \
  node --experimental-strip-types --test guides/unity-engine/addressables-load-async/grader.ts
```
Expected: at least 4 failures (no AddressableAssets, no async API, no await, has Resources.Load).

- [ ] **Step 8: Commit**

```bash
git add guides/unity-engine/addressables-load-async/
git commit -m "feat(guides): add addressables-load-async guide + grader"
```

---

## Task 5: `scriptableobject-shared-state`

**Files:**
- Create: `guides/unity-engine/scriptableobject-shared-state/{guide.md, expectations.md, tasks/task.md, demo/GameSettings.cs, negative-demo/GameSettings.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/unity-engine/scriptableobject-shared-state/guide.md`:

```markdown
---
id: scriptableobject-shared-state
category: unity-engine
title: ScriptableObject as shared data container (Unity 6)
description: Hold project-wide configuration and shared runtime state in ScriptableObject assets instead of singleton MonoBehaviours or static fields.
useCases:
  - "share data between Unity scenes without singletons"
  - "store game settings as an asset"
  - "decouple systems via ScriptableObject events"
  - "replace static configuration class with ScriptableObject"
  - "avoid DontDestroyOnLoad singleton pattern"
relatedGuides: []
appliesTo:
  - "any class that holds project-wide configuration or shared state"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# ScriptableObject as shared data container

`ScriptableObject` is Unity's serialized asset class for data that lives in the project (not in a scene). It's the modern alternative to:
- Singleton `MonoBehaviour` patterns with `DontDestroyOnLoad`
- Static configuration classes
- "GameManager" god-objects

Treating shared state as data assets makes it inspectable in the editor, version-controllable, and decoupled from scene lifetimes.

## Define a settings asset

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "GameSettings", menuName = "Game/Settings")]
public class GameSettings : ScriptableObject
{
    [Range(0f, 1f)] public float musicVolume = 0.7f;
    [Range(0f, 1f)] public float sfxVolume = 0.9f;
    public int targetFrameRate = 60;
}
```

Then consume by reference:

```csharp
using UnityEngine;

public class AudioController : MonoBehaviour
{
    [SerializeField] private GameSettings settings;

    void Start()
    {
        AudioListener.volume = settings.musicVolume;
        Application.targetFrameRate = settings.targetFrameRate;
    }
}
```

## Avoid

- `public static GameSettings Instance` singleton patterns. They tie lifetime to runtime, hide dependencies, and break domain reload.
- `DontDestroyOnLoad` GameObject carrying configuration — same issues.
- `static` mutable fields in `MonoBehaviour` subclasses — domain reload zeroes them between play sessions.

## Gotchas

- ScriptableObject mutations made at runtime persist to the asset in the Editor (but not in builds). Reset values in `OnEnable` if you need fresh state.
- A consumer must hold a `[SerializeField]` reference (or load via Addressables). ScriptableObjects can't be auto-discovered without `Resources` or asset databases.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/unity-engine/scriptableobject-shared-state/expectations.md`:

```markdown
# Expectations: scriptableobject-shared-state

After applying this guide, the agent's `Assets/Scripts/GameSettings.cs` should:

1. Declare a `class GameSettings : ScriptableObject`.
2. Have a `[CreateAssetMenu(...)]` attribute on the class.
3. NOT declare a `static GameSettings Instance` field or property.
4. NOT use `DontDestroyOnLoad`.
5. Have at least one serialized field (e.g. `musicVolume`).
6. Not extend `MonoBehaviour`.
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/unity-engine/scriptableobject-shared-state/tasks/task.md`:

```markdown
# Task

`Assets/Scripts/GameSettings.cs` currently implements a singleton `MonoBehaviour` with `DontDestroyOnLoad` and a `static Instance` accessor. Refactor it into a `ScriptableObject` with a `[CreateAssetMenu]` attribute. Keep the same fields (`musicVolume`, `sfxVolume`, `targetFrameRate`). Drop the singleton accessor and the `DontDestroyOnLoad` call.
```

- [ ] **Step 4: Create `demo/GameSettings.cs`**

`guides/unity-engine/scriptableobject-shared-state/demo/GameSettings.cs`:

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "GameSettings", menuName = "Game/Settings")]
public class GameSettings : ScriptableObject
{
    [Range(0f, 1f)] public float musicVolume = 0.7f;
    [Range(0f, 1f)] public float sfxVolume = 0.9f;
    public int targetFrameRate = 60;
}
```

- [ ] **Step 5: Create `negative-demo/GameSettings.cs`**

`guides/unity-engine/scriptableobject-shared-state/negative-demo/GameSettings.cs`:

```csharp
using UnityEngine;

public class GameSettings : MonoBehaviour
{
    public static GameSettings Instance;
    public float musicVolume = 0.7f;
    public float sfxVolume = 0.9f;
    public int targetFrameRate = 60;

    void Awake()
    {
        if (Instance != null) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/unity-engine/scriptableobject-shared-state/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'GameSettings.cs');
const src = readCSharp(TARGET);

test('declares class GameSettings', () => {
  assert.ok(declaresType(src, 'class', 'GameSettings'));
});

test('extends ScriptableObject (not MonoBehaviour)', () => {
  assert.ok(hasPattern(src, /GameSettings\s*:\s*ScriptableObject/));
  assert.ok(hasNoPattern(src, /GameSettings\s*:\s*MonoBehaviour/));
});

test('has a [CreateAssetMenu(...)] attribute', () => {
  assert.ok(hasPattern(src, /\[CreateAssetMenu\s*\(/));
});

test('no static Instance field', () => {
  assert.ok(hasNoPattern(src, /\bstatic\s+GameSettings\s+Instance\b/));
});

test('no DontDestroyOnLoad call', () => {
  assert.ok(hasNoPattern(src, /\bDontDestroyOnLoad\s*\(/));
});

test('declares at least one serialized field (musicVolume / sfxVolume / targetFrameRate)', () => {
  assert.ok(hasPattern(src, /\b(musicVolume|sfxVolume|targetFrameRate)\b/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-engine/scriptableobject-shared-state/grader.ts
TARGET_FILE=$(pwd)/guides/unity-engine/scriptableobject-shared-state/negative-demo/GameSettings.cs \
  node --experimental-strip-types --test guides/unity-engine/scriptableobject-shared-state/grader.ts
```
Expected: demo passes 6/6; negative-demo fails at least 3 (extends MonoBehaviour, no CreateAssetMenu, has static Instance, has DontDestroyOnLoad).

- [ ] **Step 8: Commit**

```bash
git add guides/unity-engine/scriptableobject-shared-state/
git commit -m "feat(guides): add scriptableobject-shared-state guide + grader"
```

---

## Task 6: `gc-free-update-loop`

**Files:**
- Create: `guides/unity-performance/gc-free-update-loop/{guide.md, expectations.md, tasks/task.md, demo/EnemyAI.cs, negative-demo/EnemyAI.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/unity-performance/gc-free-update-loop/guide.md`:

```markdown
---
id: gc-free-update-loop
category: unity-performance
title: GC-free Update() loops (Unity 6)
description: Prevent per-frame heap allocations in hot paths to avoid GC spikes that cause frame hitches.
useCases:
  - "avoid GC spikes in Unity Update"
  - "fix frame stutters from allocations"
  - "remove LINQ from hot paths"
  - "stop allocating new lists every frame"
  - "cache GetComponent results"
relatedGuides:
  - object-pooling-basics
appliesTo:
  - "MonoBehaviour scripts in hot paths (Update, FixedUpdate, LateUpdate)"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# GC-free Update() loops

Every per-frame heap allocation in a hot Unity script feeds the garbage collector. Eventually the collector pauses the main thread to compact memory — a "GC spike" that causes a noticeable frame hitch.

The fix is to never allocate inside `Update`/`FixedUpdate`/`LateUpdate`. Move allocations to `Awake`/`Start`/`OnEnable` and reuse the references.

## Cache component lookups and collections

```csharp
using UnityEngine;
using System.Collections.Generic;

public class EnemyAI : MonoBehaviour
{
    private Rigidbody2D rb;
    private readonly List<Transform> nearby = new List<Transform>(16);
    private readonly Collider2D[] hits = new Collider2D[8];

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void FixedUpdate()
    {
        int count = Physics2D.OverlapCircleNonAlloc(transform.position, 5f, hits);
        nearby.Clear();
        for (int i = 0; i < count; i++) nearby.Add(hits[i].transform);
        Decide(nearby);
    }

    void Decide(List<Transform> _) {}
}
```

## Avoid

- `GetComponent<T>()` inside `Update` — cache it in `Awake`.
- `new List<T>()`, `new T[]`, `new Vector3[]` in hot paths — pre-allocate as fields.
- `Physics.OverlapSphere` / `OverlapCircle` (allocating overloads) — use the `*NonAlloc` variants.
- `System.Linq` (`Where`, `Select`, `ToList`) — allocates enumerators and lambdas per call.
- Boxing: `Debug.Log(intValue)` boxes; format strings allocate. Wrap in `if (Debug.isDebugBuild)` and use `Debug.Log($"x: {x}")` only off the hot path.

## Gotchas

- `string` concatenation (`"x: " + x`) allocates. Use `StringBuilder` if needed off hot path, or skip the log.
- `foreach` over a `List<T>` is fine in Unity 6 (allocations were fixed years ago), but `foreach` over a non-generic `IEnumerable` allocates an enumerator object.
- `Coroutine` `WaitForSeconds(0.1f)` allocates each `yield`. Cache it: `private readonly WaitForSeconds _wait01 = new WaitForSeconds(0.1f);`.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/unity-performance/gc-free-update-loop/expectations.md`:

```markdown
# Expectations: gc-free-update-loop

After applying this guide, the agent's `Assets/Scripts/EnemyAI.cs` should:

1. Cache `GetComponent<...>()` results in a field (assigned in `Awake`/`Start`), not call them in `Update`/`FixedUpdate`.
2. Not allocate `new List<...>`, `new ...[]`, or `new Dictionary<...>` inside `Update`/`FixedUpdate`/`LateUpdate`.
3. Not import `System.Linq`.
4. Use `*NonAlloc` Physics overloads (e.g. `OverlapCircleNonAlloc`) over allocating ones.
5. Not call `Debug.Log` inside `FixedUpdate` (cheap source of allocations + string formatting).
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/unity-performance/gc-free-update-loop/tasks/task.md`:

```markdown
# Task

`Assets/Scripts/EnemyAI.cs` allocates several objects every `FixedUpdate` call (a new `List<Transform>`, a `Physics2D.OverlapCircle` array, a `GetComponent<Rigidbody2D>` lookup, and a `Debug.Log` with string formatting). Refactor it to be GC-free in the hot path: pre-allocate persistent fields in `Awake`, reuse them in `FixedUpdate`, switch to `OverlapCircleNonAlloc`, and remove the `Debug.Log`.
```

- [ ] **Step 4: Create `demo/EnemyAI.cs`**

`guides/unity-performance/gc-free-update-loop/demo/EnemyAI.cs`:

```csharp
using UnityEngine;
using System.Collections.Generic;

public class EnemyAI : MonoBehaviour
{
    private Rigidbody2D rb;
    private readonly List<Transform> nearby = new List<Transform>(16);
    private readonly Collider2D[] hits = new Collider2D[8];

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void FixedUpdate()
    {
        int count = Physics2D.OverlapCircleNonAlloc(transform.position, 5f, hits);
        nearby.Clear();
        for (int i = 0; i < count; i++) nearby.Add(hits[i].transform);
        Decide(nearby);
    }

    void Decide(List<Transform> _) {}
}
```

- [ ] **Step 5: Create `negative-demo/EnemyAI.cs`**

`guides/unity-performance/gc-free-update-loop/negative-demo/EnemyAI.cs`:

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class EnemyAI : MonoBehaviour
{
    void FixedUpdate()
    {
        var rb = GetComponent<Rigidbody2D>();
        var hits = Physics2D.OverlapCircleAll(transform.position, 5f);
        var nearby = hits.Select(h => h.transform).ToList();
        Debug.Log("Nearby count: " + nearby.Count);
        Decide(nearby);
    }

    void Decide(List<Transform> _) {}
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/unity-performance/gc-free-update-loop/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, methodCallsAst, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'EnemyAI.cs');
const src = readCSharp(TARGET);

test('does not import System.Linq', () => {
  assert.ok(!usesNamespace(src, 'System.Linq'));
});

test('GetComponent is called in Awake or Start, not in a hot loop', () => {
  // Strict-but-fair: total GetComponent call count <= 1 (the cache in Awake/Start).
  const calls = methodCallsAst(src, 'GetComponent');
  assert.ok(calls.count <= 1, `expected at most 1 GetComponent call, got ${calls.count}`);
});

test('no new List<...> / new ...[] inside FixedUpdate', () => {
  // Find FixedUpdate body and check it doesn't allocate common types.
  const fixedUpdate = src.match(/void\s+FixedUpdate\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
  if (fixedUpdate) {
    const body = fixedUpdate[1];
    assert.ok(!/\bnew\s+List<|\bnew\s+Dictionary<|\bnew\s+\w+\[/.test(body),
      `FixedUpdate allocates: ${body.match(/\bnew\s+\S+/g)?.join(', ')}`);
  }
});

test('uses NonAlloc Physics overload (or no allocating Overlap call)', () => {
  if (hasPattern(src, /\bPhysics2?\.Overlap/)) {
    assert.ok(hasPattern(src, /OverlapCircleNonAlloc|OverlapBoxNonAlloc|OverlapSphereNonAlloc/),
      'Used Overlap* but not the NonAlloc variant');
  }
});

test('no Debug.Log inside FixedUpdate', () => {
  const fixedUpdate = src.match(/void\s+FixedUpdate\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
  if (fixedUpdate) {
    assert.ok(!/\bDebug\.(Log|LogWarning|LogError)\b/.test(fixedUpdate[1]));
  }
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-performance/gc-free-update-loop/grader.ts
TARGET_FILE=$(pwd)/guides/unity-performance/gc-free-update-loop/negative-demo/EnemyAI.cs \
  node --experimental-strip-types --test guides/unity-performance/gc-free-update-loop/grader.ts
```
Expected: demo 5/5; negative-demo fails at least 3 (Linq import, GetComponent in FixedUpdate, allocation in FixedUpdate, OverlapAll not NonAlloc, Debug.Log in FixedUpdate).

- [ ] **Step 8: Commit**

```bash
git add guides/unity-performance/
git commit -m "feat(guides): add gc-free-update-loop guide + grader"
```

---

## Task 7: `object-pooling-basics`

**Files:**
- Create: `guides/unity-performance/object-pooling-basics/{guide.md, expectations.md, tasks/task.md, demo/BulletSpawner.cs, negative-demo/BulletSpawner.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/unity-performance/object-pooling-basics/guide.md`:

```markdown
---
id: object-pooling-basics
category: unity-performance
title: Object pooling with UnityEngine.Pool (Unity 6)
description: Pool frequently spawned and destroyed objects (bullets, particles, enemies) using UnityEngine.Pool.ObjectPool to avoid Instantiate/Destroy cost.
useCases:
  - "pool bullets in Unity"
  - "avoid Destroy and Instantiate cost"
  - "reuse spawned objects"
  - "ObjectPool for particles"
  - "fix spawn / despawn frame drops"
relatedGuides:
  - gc-free-update-loop
appliesTo:
  - "any spawner that creates / destroys objects more than ~10/sec"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Object pooling with UnityEngine.Pool

`Instantiate` and `Destroy` are expensive: Instantiate allocates and serializes prefab state; Destroy schedules teardown that defers GC. For anything spawned frequently (bullets, particles, hit-flash sprites, enemies in waves), use Unity 6's built-in `UnityEngine.Pool.ObjectPool<T>`.

## Pool reusable instances

```csharp
using UnityEngine;
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet bulletPrefab;
    private ObjectPool<Bullet> pool;

    void Awake()
    {
        pool = new ObjectPool<Bullet>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: b => b.gameObject.SetActive(true),
            actionOnRelease: b => b.gameObject.SetActive(false),
            actionOnDestroy: b => Destroy(b.gameObject),
            defaultCapacity: 32,
            maxSize: 256);
    }

    public void Fire(Vector3 from, Vector3 dir)
    {
        var b = pool.Get();
        b.Launch(from, dir, onExpire: () => pool.Release(b));
    }
}
```

## Avoid

- Bare `Instantiate(prefab)` followed by `Destroy(go)` for short-lived objects.
- Hand-rolled pools (`Stack<T>`, `Queue<T>`) — `UnityEngine.Pool.ObjectPool<T>` is dependency-free, threadsafe-on-the-main-thread, and has built-in capacity controls.
- Pooling objects with active subscriptions/coroutines without resetting state on `Get` and unsubscribing on `Release`.

## Gotchas

- Pooled objects retain field values between uses — explicitly reset transient state in `actionOnGet`.
- `Destroy()` of a pooled object that's been Released and then `Destroy`d twice will throw. Track ownership.
- The pool's `maxSize` bounds memory, but oversized pools defeat the purpose. Profile your peak count, then add ~20% headroom.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/unity-performance/object-pooling-basics/expectations.md`:

```markdown
# Expectations: object-pooling-basics

After applying this guide, the agent's `Assets/Scripts/BulletSpawner.cs` should:

1. Import `UnityEngine.Pool`.
2. Declare an `ObjectPool<Bullet>` field.
3. Initialize the pool in `Awake` (or `Start`) with at least `createFunc`, `actionOnGet`, `actionOnRelease`.
4. Call `pool.Get()` instead of `Instantiate(bulletPrefab)` in the spawn path.
5. Call `pool.Release(...)` somewhere (typically from the bullet's expiration callback).
6. Not call `Destroy(bullet)` in the spawn / despawn path (let the pool's `actionOnDestroy` handle terminal cleanup).
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/unity-performance/object-pooling-basics/tasks/task.md`:

```markdown
# Task

`Assets/Scripts/BulletSpawner.cs` currently calls `Instantiate(bulletPrefab, ...)` to create bullets and `Destroy(bullet)` 2 seconds later. Replace this with a `UnityEngine.Pool.ObjectPool<Bullet>` configured in `Awake`. The spawner's `Fire()` method should call `pool.Get()` and pass a release callback to the bullet so it can `pool.Release(itself)` when it expires.
```

- [ ] **Step 4: Create `demo/BulletSpawner.cs`**

`guides/unity-performance/object-pooling-basics/demo/BulletSpawner.cs`:

```csharp
using UnityEngine;
using UnityEngine.Pool;

public class Bullet : MonoBehaviour
{
    public void Launch(Vector3 from, Vector3 dir, System.Action onExpire) {}
}

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet bulletPrefab;
    private ObjectPool<Bullet> pool;

    void Awake()
    {
        pool = new ObjectPool<Bullet>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: b => b.gameObject.SetActive(true),
            actionOnRelease: b => b.gameObject.SetActive(false),
            actionOnDestroy: b => Destroy(b.gameObject),
            defaultCapacity: 32,
            maxSize: 256);
    }

    public void Fire(Vector3 from, Vector3 dir)
    {
        var b = pool.Get();
        b.Launch(from, dir, onExpire: () => pool.Release(b));
    }
}
```

- [ ] **Step 5: Create `negative-demo/BulletSpawner.cs`**

`guides/unity-performance/object-pooling-basics/negative-demo/BulletSpawner.cs`:

```csharp
using UnityEngine;

public class Bullet : MonoBehaviour
{
    public void Launch(Vector3 from, Vector3 dir) {}
}

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet bulletPrefab;

    public void Fire(Vector3 from, Vector3 dir)
    {
        var b = Instantiate(bulletPrefab);
        b.Launch(from, dir);
        Destroy(b.gameObject, 2f);
    }
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/unity-performance/object-pooling-basics/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'BulletSpawner.cs');
const src = readCSharp(TARGET);

test('imports UnityEngine.Pool', () => {
  assert.ok(usesNamespace(src, 'UnityEngine.Pool'));
});

test('declares an ObjectPool<...> field', () => {
  assert.ok(hasPattern(src, /\bObjectPool<\w+>\s+\w+\s*[;=]/));
});

test('initializes the pool with createFunc and action callbacks', () => {
  assert.ok(hasPattern(src, /createFunc\s*:/));
  assert.ok(hasPattern(src, /actionOnGet\s*:/));
  assert.ok(hasPattern(src, /actionOnRelease\s*:/));
});

test('Fire path uses pool.Get() instead of Instantiate', () => {
  const fire = src.match(/Fire\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
  if (fire) {
    assert.ok(/\.Get\s*\(\s*\)/.test(fire[1]),
      'Fire should call pool.Get(), not Instantiate');
    assert.ok(!/\bInstantiate\s*\(\s*bulletPrefab\b/.test(fire[1]),
      'Fire should not call Instantiate(bulletPrefab) directly');
  }
});

test('calls pool.Release somewhere in the file', () => {
  assert.ok(hasPattern(src, /\.Release\s*\(/));
});

test('no Destroy(bullet, time) timeout pattern', () => {
  assert.ok(hasNoPattern(src, /\bDestroy\s*\([^,)]+,\s*[0-9.]+f?\s*\)/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-performance/object-pooling-basics/grader.ts
TARGET_FILE=$(pwd)/guides/unity-performance/object-pooling-basics/negative-demo/BulletSpawner.cs \
  node --experimental-strip-types --test guides/unity-performance/object-pooling-basics/grader.ts
```
Expected: demo 6/6; negative-demo fails at least 4 (no UnityEngine.Pool, no ObjectPool field, no pool.Get, no pool.Release, has timed Destroy).

- [ ] **Step 8: Commit**

```bash
git add guides/unity-performance/object-pooling-basics/
git commit -m "feat(guides): add object-pooling-basics guide + grader"
```

---

## Task 8: `urp-srp-batcher-friendly-materials`

**Files:**
- Create: `guides/unity-performance/urp-srp-batcher-friendly-materials/{guide.md, expectations.md, tasks/task.md, demo/PropMaterialApplier.cs, negative-demo/PropMaterialApplier.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/unity-performance/urp-srp-batcher-friendly-materials/guide.md`:

```markdown
---
id: urp-srp-batcher-friendly-materials
category: unity-performance
title: SRP Batcher-friendly material usage (URP, Unity 6)
description: Use MaterialPropertyBlock for per-instance variation instead of cloning materials, so URP's SRP Batcher can keep batching draw calls.
useCases:
  - "fix SRP Batcher breaking in URP"
  - "per-renderer color without instancing"
  - "reduce draw calls in URP"
  - "MaterialPropertyBlock vs material.color"
  - "avoid material cloning at runtime"
relatedGuides: []
appliesTo:
  - "any script that tints or modifies a per-instance material property at runtime"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# SRP Batcher-friendly material usage

URP's [SRP Batcher](https://docs.unity3d.com/Manual/SRPBatcher.html) reduces CPU overhead by batching draw calls that share a shader (not necessarily a material). The moment you touch `renderer.material.color`, Unity *clones* the material into a unique instance — and that instance loses SRP Batcher compatibility for that renderer.

Use `MaterialPropertyBlock` instead. It overrides shader properties per-renderer without cloning the material.

## Per-renderer tint without cloning

```csharp
using UnityEngine;

public class PropMaterialApplier : MonoBehaviour
{
    private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
    private Renderer rend;
    private MaterialPropertyBlock mpb;

    void Awake()
    {
        rend = GetComponent<Renderer>();
        mpb = new MaterialPropertyBlock();
    }

    public void SetColor(Color c)
    {
        rend.GetPropertyBlock(mpb);
        mpb.SetColor(BaseColorId, c);
        rend.SetPropertyBlock(mpb);
    }
}
```

## Avoid

- `renderer.material.color = ...` — clones the material per instance.
- `renderer.materials[0] = ...` (assigning a new material array) — also clones.
- Per-renderer shader keyword toggling without `MaterialPropertyBlock` integration — same cost.

## Gotchas

- Use `Shader.PropertyToID(...)` once (static readonly), not the string overload every call — string lookups are expensive.
- `_BaseColor` is URP's color property name; built-in RP uses `_Color`. Don't mix.
- `MaterialPropertyBlock` overrides survive scene saves only if applied in edit mode via `[ExecuteAlways]`. For runtime-only tints this doesn't matter.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/unity-performance/urp-srp-batcher-friendly-materials/expectations.md`:

```markdown
# Expectations: urp-srp-batcher-friendly-materials

After applying this guide, the agent's `Assets/Scripts/PropMaterialApplier.cs` should:

1. Declare a `MaterialPropertyBlock` field, instantiated in `Awake`.
2. Cache the shader property ID via `Shader.PropertyToID(...)` as a `static readonly int`.
3. Use `Renderer.GetPropertyBlock` + `SetColor` + `SetPropertyBlock` to apply per-instance color.
4. NOT access `.material.color`, `.material.SetColor`, or `.materials[0]`.
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/unity-performance/urp-srp-batcher-friendly-materials/tasks/task.md`:

```markdown
# Task

`Assets/Scripts/PropMaterialApplier.cs` currently tints its renderer by setting `GetComponent<Renderer>().material.color = c`. This breaks URP's SRP Batcher. Refactor it to use a `MaterialPropertyBlock` cached in `Awake` and a `Shader.PropertyToID("_BaseColor")` static readonly id.
```

- [ ] **Step 4: Create `demo/PropMaterialApplier.cs`**

`guides/unity-performance/urp-srp-batcher-friendly-materials/demo/PropMaterialApplier.cs`:

```csharp
using UnityEngine;

public class PropMaterialApplier : MonoBehaviour
{
    private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
    private Renderer rend;
    private MaterialPropertyBlock mpb;

    void Awake()
    {
        rend = GetComponent<Renderer>();
        mpb = new MaterialPropertyBlock();
    }

    public void SetColor(Color c)
    {
        rend.GetPropertyBlock(mpb);
        mpb.SetColor(BaseColorId, c);
        rend.SetPropertyBlock(mpb);
    }
}
```

- [ ] **Step 5: Create `negative-demo/PropMaterialApplier.cs`**

`guides/unity-performance/urp-srp-batcher-friendly-materials/negative-demo/PropMaterialApplier.cs`:

```csharp
using UnityEngine;

public class PropMaterialApplier : MonoBehaviour
{
    public void SetColor(Color c)
    {
        GetComponent<Renderer>().material.color = c;
    }
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/unity-performance/urp-srp-batcher-friendly-materials/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PropMaterialApplier.cs');
const src = readCSharp(TARGET);

test('declares a MaterialPropertyBlock field', () => {
  assert.ok(hasPattern(src, /\bMaterialPropertyBlock\b/));
});

test('caches Shader.PropertyToID as static readonly int', () => {
  assert.ok(hasPattern(src, /static\s+readonly\s+int\s+\w+\s*=\s*Shader\.PropertyToID\s*\(/));
});

test('uses GetPropertyBlock + SetPropertyBlock', () => {
  assert.ok(hasPattern(src, /\.GetPropertyBlock\s*\(/));
  assert.ok(hasPattern(src, /\.SetPropertyBlock\s*\(/));
});

test('does not assign .material.color', () => {
  assert.ok(hasNoPattern(src, /\.material\.color\s*=/));
});

test('does not call .material.SetColor', () => {
  assert.ok(hasNoPattern(src, /\.material\.SetColor\s*\(/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-performance/urp-srp-batcher-friendly-materials/grader.ts
TARGET_FILE=$(pwd)/guides/unity-performance/urp-srp-batcher-friendly-materials/negative-demo/PropMaterialApplier.cs \
  node --experimental-strip-types --test guides/unity-performance/urp-srp-batcher-friendly-materials/grader.ts
```
Expected: demo 5/5; negative-demo fails at least 3 (no MaterialPropertyBlock, no PropertyToID, no Get/SetPropertyBlock, has .material.color).

- [ ] **Step 8: Commit**

```bash
git add guides/unity-performance/urp-srp-batcher-friendly-materials/
git commit -m "feat(guides): add urp-srp-batcher-friendly-materials guide + grader"
```

---

## Task 9: `hit-stop-on-impact`

**Files:**
- Create: `guides/game-design-action/hit-stop-on-impact/{guide.md, expectations.md, tasks/task.md, demo/HitFeedback.cs, negative-demo/HitFeedback.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/game-design-action/hit-stop-on-impact/guide.md`:

```markdown
---
id: hit-stop-on-impact
category: game-design-action
title: Hit-stop on impact (action / brawler combat feel)
description: Briefly pause time on contact (50–100ms) to communicate weight and let the player register the hit. A core ingredient of crunchy action-game combat feel.
useCases:
  - "make hits feel weighty in a brawler"
  - "add hit-stop / hit-freeze on impact"
  - "implement screen pause when an attack connects"
  - "Unity Time.timeScale for combat impact"
  - "game feel polish for melee combat"
relatedGuides:
  - gc-free-update-loop
appliesTo:
  - "any action game with player-controlled melee/projectile combat"
---

# Hit-stop on impact

Hit-stop (a.k.a. hit-freeze, hit-lag) is a brief pause of game time on the frame an attack lands. It's used universally in action-game combat — Smash Bros, Hollow Knight, brawlers — to:

1. Communicate weight: heavier hits = longer hit-stop.
2. Give the player a single frame to register the connection before the world resumes.
3. Mask animation transitions; the attacker is "stuck" on the impact frame for a few ms.

The mechanic is cheap: ~50–100ms `Time.timeScale = 0` (or scale-down) followed by a restore.

## Implementation

```csharp
using System.Collections;
using UnityEngine;

public class HitFeedback : MonoBehaviour
{
    [SerializeField] private float defaultDuration = 0.06f;
    private Coroutine running;

    public void HitStop(float duration = -1f)
    {
        if (duration < 0f) duration = defaultDuration;
        if (running != null) StopCoroutine(running);
        running = StartCoroutine(HitStopRoutine(duration));
    }

    private IEnumerator HitStopRoutine(float duration)
    {
        Time.timeScale = 0f;
        // WaitForSecondsRealtime ignores timeScale so we actually wait.
        yield return new WaitForSecondsRealtime(duration);
        Time.timeScale = 1f;
        running = null;
    }
}
```

Call `HitFeedback.HitStop(0.08f)` from the attacker's collision/hit confirmation. Scale duration with hit strength (light: 40ms, heavy: 120ms).

## Avoid

- Pausing with `Time.timeScale = 0` and then waiting with `yield return new WaitForSeconds(...)`. `WaitForSeconds` is governed by `timeScale`, so the coroutine never resumes.
- Forgetting to restore `Time.timeScale = 1`. A bug that pauses an attack mid-swing strands the game.
- Hit-stop longer than ~150ms — past that it feels broken, not weighty.

## Gotchas

- If you have a global pause system, hit-stop must respect it (don't restore time-scale to 1 if the player paused mid-stop).
- AudioSource pitch can also pause briefly for tactile feel — but only on impactful hits, not every attack.
- For non-time-based hit-stop (e.g., physics-driven combat), zero the attacker's `rigidbody.linearVelocity` for the same duration instead of `timeScale`.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/game-design-action/hit-stop-on-impact/expectations.md`:

```markdown
# Expectations: hit-stop-on-impact

After applying this guide, the agent's `Assets/Scripts/HitFeedback.cs` should:

1. Have a public `HitStop(...)` method.
2. Set `Time.timeScale = 0f` (or a value < 1) inside a coroutine.
3. Use `WaitForSecondsRealtime` (not `WaitForSeconds`) so the wait actually elapses while timeScale is paused.
4. Restore `Time.timeScale = 1f` after the wait.
5. Use a duration in the range 0.03f to 0.15f (sensible hit-stop window).
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/game-design-action/hit-stop-on-impact/tasks/task.md`:

```markdown
# Task

`Assets/Scripts/HitFeedback.cs` has a `HitStop(float duration)` stub. Implement it so it briefly pauses gameplay (Time.timeScale = 0) and then restores it after `duration` seconds of real time. Use a coroutine and `WaitForSecondsRealtime`. Default duration should be ~60ms.
```

- [ ] **Step 4: Create `demo/HitFeedback.cs`**

`guides/game-design-action/hit-stop-on-impact/demo/HitFeedback.cs`:

```csharp
using System.Collections;
using UnityEngine;

public class HitFeedback : MonoBehaviour
{
    [SerializeField] private float defaultDuration = 0.06f;
    private Coroutine running;

    public void HitStop(float duration = -1f)
    {
        if (duration < 0f) duration = defaultDuration;
        if (running != null) StopCoroutine(running);
        running = StartCoroutine(HitStopRoutine(duration));
    }

    private IEnumerator HitStopRoutine(float duration)
    {
        Time.timeScale = 0f;
        yield return new WaitForSecondsRealtime(duration);
        Time.timeScale = 1f;
        running = null;
    }
}
```

- [ ] **Step 5: Create `negative-demo/HitFeedback.cs`**

`guides/game-design-action/hit-stop-on-impact/negative-demo/HitFeedback.cs`:

```csharp
using UnityEngine;

public class HitFeedback : MonoBehaviour
{
    public void HitStop(float duration = -1f)
    {
        // Naive: assigns timeScale but never restores. Or uses WaitForSeconds (won't resume).
        Time.timeScale = 0f;
    }
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/game-design-action/hit-stop-on-impact/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'HitFeedback.cs');
const src = readCSharp(TARGET);

test('declares a public HitStop method', () => {
  assert.ok(hasPattern(src, /public\s+\S+\s+HitStop\s*\(/));
});

test('sets Time.timeScale to 0 (or < 1) somewhere', () => {
  assert.ok(hasPattern(src, /Time\.timeScale\s*=\s*0(?:\.0+)?f?/) ||
            hasPattern(src, /Time\.timeScale\s*=\s*0\.[1-9]/));
});

test('restores Time.timeScale to 1 somewhere', () => {
  assert.ok(hasPattern(src, /Time\.timeScale\s*=\s*1(?:\.0+)?f?/));
});

test('uses WaitForSecondsRealtime (not plain WaitForSeconds)', () => {
  assert.ok(hasPattern(src, /\bWaitForSecondsRealtime\b/));
  assert.ok(hasNoPattern(src, /\bnew\s+WaitForSeconds\b/));
});

test('uses a sensible hit-stop duration (between 0.03 and 0.15 seconds)', () => {
  const matches = src.match(/\b0\.(0[3-9]|1[0-5]?)\d*f?\b/g);
  assert.ok(matches && matches.length >= 1,
    `expected a duration literal between 0.03 and 0.15, found none in: ${src.match(/\b\d+\.\d+f?\b/g)?.join(', ')}`);
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-action/hit-stop-on-impact/grader.ts
TARGET_FILE=$(pwd)/guides/game-design-action/hit-stop-on-impact/negative-demo/HitFeedback.cs \
  node --experimental-strip-types --test guides/game-design-action/hit-stop-on-impact/grader.ts
```
Expected: demo 5/5; negative-demo fails at least 2 (no Time.timeScale=1 restore, no WaitForSecondsRealtime, no valid duration).

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-action/hit-stop-on-impact/
git commit -m "feat(guides): add hit-stop-on-impact guide + grader"
```

---

## Task 10: `input-buffering`

**Files:**
- Create: `guides/game-design-action/input-buffering/{guide.md, expectations.md, tasks/task.md, demo/InputBuffer.cs, negative-demo/InputBuffer.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/game-design-action/input-buffering/guide.md`:

```markdown
---
id: input-buffering
category: game-design-action
title: Input buffering for responsive action controls
description: Hold queued inputs for ~100–200ms so player presses during animation lockouts still register on the first frame the character becomes actionable.
useCases:
  - "make Unity action controls feel responsive"
  - "buffer jump input during animation"
  - "input feels late or dropped"
  - "queue attack inputs in a brawler"
  - "fixed input window after pressing button"
relatedGuides: []
appliesTo:
  - "any action / platformer / brawler with attack or movement animations that lock input"
---

# Input buffering

In responsive action games, the player must be able to press an input *slightly before* the character can act on it and have the press still register. Without buffering, the input is dropped — the player perceives "controls feel late" or "the game ate my input."

A timer-based buffer is the standard fix: when the player presses the input, store the timestamp; when the character becomes actionable, consume any input whose timestamp is within the buffer window (commonly 100–200ms).

## Implementation

```csharp
using UnityEngine;

public class InputBuffer : MonoBehaviour
{
    [SerializeField] private float bufferWindow = 0.15f;
    private float bufferedAt = -1f;

    public void OnJumpPressed()
    {
        bufferedAt = Time.time;
    }

    public bool TryConsumeJump()
    {
        if (bufferedAt < 0f) return false;
        if (Time.time - bufferedAt > bufferWindow) return false;
        bufferedAt = -1f;
        return true;
    }
}
```

The character controller calls `TryConsumeJump()` on every frame it's actionable; if it returns true, it jumps.

## Avoid

- Reading `Input.GetButtonDown("Jump")` only inside `Update` while the character is locked — the down-press is consumed by the frame even though no action was taken.
- Buffer windows >300ms — feels like the game is choosing actions for the player.
- Buffer windows <50ms — defeats the purpose (single-frame humans can't reliably hit a 1-frame window at 60Hz).

## Gotchas

- Pair this with **coyote time** (the inverse: allow the input to fire shortly *after* the character leaves the actionable state, e.g., walking off a ledge). Buffering covers "early," coyote time covers "late."
- If multiple actions share a buffer (jump + attack), give each its own timestamp — they expire independently.
- For one-shot buffers, set the timestamp to a sentinel (`-1f` here) after consumption so a single press isn't consumed twice.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/game-design-action/input-buffering/expectations.md`:

```markdown
# Expectations: input-buffering

After applying this guide, the agent's `Assets/Scripts/InputBuffer.cs` should:

1. Have a serialized field for the buffer window duration (e.g. `bufferWindow`).
2. Store the press time in a field (e.g. `bufferedAt`).
3. Have a method that records the press (e.g. `OnJumpPressed`).
4. Have a method that returns true only if a press is within the buffer window AND clears the buffer (`TryConsumeJump`).
5. Use a buffer window in the range 0.05f to 0.3f (sensible window).
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/game-design-action/input-buffering/tasks/task.md`:

```markdown
# Task

Implement an input buffer in `Assets/Scripts/InputBuffer.cs`. Provide `OnJumpPressed()` to record the press and `TryConsumeJump(): bool` that returns true if a press happened within the last `bufferWindow` seconds (default 0.15f). Clear the buffer when consumed.
```

- [ ] **Step 4: Create `demo/InputBuffer.cs`**

`guides/game-design-action/input-buffering/demo/InputBuffer.cs`:

```csharp
using UnityEngine;

public class InputBuffer : MonoBehaviour
{
    [SerializeField] private float bufferWindow = 0.15f;
    private float bufferedAt = -1f;

    public void OnJumpPressed()
    {
        bufferedAt = Time.time;
    }

    public bool TryConsumeJump()
    {
        if (bufferedAt < 0f) return false;
        if (Time.time - bufferedAt > bufferWindow) return false;
        bufferedAt = -1f;
        return true;
    }
}
```

- [ ] **Step 5: Create `negative-demo/InputBuffer.cs`**

`guides/game-design-action/input-buffering/negative-demo/InputBuffer.cs`:

```csharp
using UnityEngine;

public class InputBuffer : MonoBehaviour
{
    // No buffer at all — single-frame check.
    public bool TryConsumeJump()
    {
        return Input.GetButtonDown("Jump");
    }
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/game-design-action/input-buffering/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'InputBuffer.cs');
const src = readCSharp(TARGET);

test('declares a serialized buffer-window field', () => {
  assert.ok(hasPattern(src, /\[SerializeField\][\s\S]*?\bfloat\s+\w+/));
});

test('stores press time in a field', () => {
  // A float field that gets assigned Time.time somewhere.
  assert.ok(hasPattern(src, /\bfloat\s+\w+/));
  assert.ok(hasPattern(src, /=\s*Time\.time\b/));
});

test('has a press handler (OnJumpPressed or similar that assigns Time.time)', () => {
  assert.ok(hasPattern(src, /void\s+\w*Press\w*\s*\(/));
});

test('has a consume method that compares Time.time against the buffer window', () => {
  assert.ok(hasPattern(src, /\bTryConsume\w+\s*\(/));
  // Body should use Time.time - someField pattern.
  assert.ok(hasPattern(src, /Time\.time\s*-\s*\w+/));
});

test('clears the buffer on consume (sentinel assignment)', () => {
  assert.ok(hasPattern(src, /=\s*-1(?:\.0+)?f?\b/));
});

test('buffer window in sensible range (0.05f to 0.3f)', () => {
  const numerics = src.match(/=\s*(0\.\d+)f?/g);
  const ok = !!numerics?.some(m => {
    const v = parseFloat(m.replace(/[^\d.]/g, ''));
    return v >= 0.05 && v <= 0.3;
  });
  assert.ok(ok, `expected buffer window literal in [0.05, 0.3]; saw: ${numerics?.join(', ')}`);
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-action/input-buffering/grader.ts
TARGET_FILE=$(pwd)/guides/game-design-action/input-buffering/negative-demo/InputBuffer.cs \
  node --experimental-strip-types --test guides/game-design-action/input-buffering/grader.ts
```
Expected: demo 6/6; negative-demo fails at least 4 (no SerializeField, no Time.time assignment, no press handler, no Time.time subtraction, no sentinel, no sensible window).

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-action/input-buffering/
git commit -m "feat(guides): add input-buffering guide + grader"
```

---

## Task 11: `knockback-with-control-takeback`

**Files:**
- Create: `guides/game-design-action/knockback-with-control-takeback/{guide.md, expectations.md, tasks/task.md, demo/Knockback.cs, negative-demo/Knockback.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/game-design-action/knockback-with-control-takeback/guide.md`:

```markdown
---
id: knockback-with-control-takeback
category: game-design-action
title: Knockback that returns control quickly
description: Apply impact-based knockback to the player but cap the lockout window (≤300ms). Long lockouts feel punishing; the player must regain agency before the next decision is needed.
useCases:
  - "implement player knockback in Unity"
  - "knockback feels too long or punishing"
  - "stun duration for player hits"
  - "give player control back after a hit"
  - "balance hit-stun in a brawler"
relatedGuides:
  - hit-stop-on-impact
appliesTo:
  - "any action game where the player gets hit and is briefly stunned"
---

# Knockback that returns control quickly

When the player takes a hit, the world should react — knockback velocity, screen shake, hitsound. But the player must regain control within a tight window (typically 100–300ms). Long lockouts cascade: a 500ms stun followed by another hit means the player watches their character die without input.

The fix is to separate the **visual reaction** (which can persist as long as feels good) from the **input lockout** (which must be short).

## Implementation

```csharp
using UnityEngine;

public class Knockback : MonoBehaviour
{
    [SerializeField] private float lockoutDuration = 0.18f;
    [SerializeField] private Rigidbody2D rb;
    private float lockoutEndsAt = -1f;

    public bool IsLockedOut => Time.time < lockoutEndsAt;

    public void ApplyHit(Vector2 impulse)
    {
        rb.AddForce(impulse, ForceMode2D.Impulse);
        lockoutEndsAt = Time.time + lockoutDuration;
    }
}
```

Consumers (`PlayerController.Update`) check `IsLockedOut` and skip movement input during the window — but the knockback velocity continues to apply via the Rigidbody until friction/drag dissipates it.

## Avoid

- Lockouts >300ms. Players read this as "the game is taking turns away from me."
- Coupling lockout duration to knockback magnitude in a way that scales above the cap (e.g., heavy hit → 600ms lockout). Cap it.
- Disabling the rigidbody during lockout — the player should still drift with the impulse, just not steer.
- Forgetting to drop the lockout if the player dies mid-stun (loops cause input drops on the respawn frame).

## Gotchas

- Pair lockout with `hit-stop-on-impact` for the punchy first frames, then resume normal time with the knockback impulse still active.
- For platformers, allow horizontal input during lockout even if you lock attacks — directional steering during a stun feels good.
- If you have multiple lockout sources (knockback, parry, animation), unify into one `IsLockedOut` check rather than checking each.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/game-design-action/knockback-with-control-takeback/expectations.md`:

```markdown
# Expectations: knockback-with-control-takeback

After applying this guide, the agent's `Assets/Scripts/Knockback.cs` should:

1. Have a serialized field for the lockout duration.
2. Cap the lockout duration at <= 0.3f (per the guide's principle of returning control quickly).
3. Have a public `ApplyHit(Vector2 impulse)` method that applies a Rigidbody2D impulse and starts the lockout.
4. Expose an `IsLockedOut` boolean/property that consumers can check.
5. Use `Time.time` to measure the lockout window (not a coroutine, so it composes with other locks).
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/game-design-action/knockback-with-control-takeback/tasks/task.md`:

```markdown
# Task

Implement `Assets/Scripts/Knockback.cs`. Provide:
- `ApplyHit(Vector2 impulse)` that adds force to a serialized Rigidbody2D field and starts a lockout window.
- A read-only `IsLockedOut` property that returns true while the lockout is active.
- A serialized `lockoutDuration` field (default 0.18f). Cap it to 0.3f maximum — long lockouts feel punishing.
```

- [ ] **Step 4: Create `demo/Knockback.cs`**

`guides/game-design-action/knockback-with-control-takeback/demo/Knockback.cs`:

```csharp
using UnityEngine;

public class Knockback : MonoBehaviour
{
    [SerializeField] private float lockoutDuration = 0.18f;
    [SerializeField] private Rigidbody2D rb;
    private float lockoutEndsAt = -1f;

    public bool IsLockedOut => Time.time < lockoutEndsAt;

    public void ApplyHit(Vector2 impulse)
    {
        rb.AddForce(impulse, ForceMode2D.Impulse);
        lockoutEndsAt = Time.time + lockoutDuration;
    }
}
```

- [ ] **Step 5: Create `negative-demo/Knockback.cs`**

`guides/game-design-action/knockback-with-control-takeback/negative-demo/Knockback.cs`:

```csharp
using UnityEngine;

public class Knockback : MonoBehaviour
{
    [SerializeField] private float lockoutDuration = 0.8f; // way too long
    [SerializeField] private Rigidbody2D rb;

    public void ApplyHit(Vector2 impulse)
    {
        rb.AddForce(impulse, ForceMode2D.Impulse);
        // No IsLockedOut exposed; consumers can't read state.
    }
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/game-design-action/knockback-with-control-takeback/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'Knockback.cs');
const src = readCSharp(TARGET);

test('declares ApplyHit(Vector2 impulse)', () => {
  assert.ok(hasPattern(src, /\bvoid\s+ApplyHit\s*\(\s*Vector2\s+\w+\s*\)/));
});

test('applies force to a Rigidbody2D (AddForce)', () => {
  assert.ok(hasPattern(src, /\b\w*\.?AddForce\s*\(/));
});

test('exposes IsLockedOut (property or method)', () => {
  assert.ok(hasPattern(src, /\bIsLockedOut\b/));
});

test('uses Time.time to gate the lockout', () => {
  assert.ok(hasPattern(src, /\bTime\.time\b/));
});

test('lockout duration default literal is <= 0.3', () => {
  const m = src.match(/lockoutDuration\s*=\s*(\d+\.\d+)f?/);
  assert.ok(m, 'expected `lockoutDuration = <number>f` literal');
  const v = parseFloat(m![1]);
  assert.ok(v <= 0.3, `lockoutDuration default ${v} > 0.3 — guide caps lockouts at 0.3s`);
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-action/knockback-with-control-takeback/grader.ts
TARGET_FILE=$(pwd)/guides/game-design-action/knockback-with-control-takeback/negative-demo/Knockback.cs \
  node --experimental-strip-types --test guides/game-design-action/knockback-with-control-takeback/grader.ts
```
Expected: demo 5/5; negative-demo fails at least 2 (no IsLockedOut, no Time.time use, lockoutDuration > 0.3).

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-action/knockback-with-control-takeback/
git commit -m "feat(guides): add knockback-with-control-takeback guide + grader"
```

---

## Task 12: `run-pacing-3-act-structure`

**Files:**
- Create: `guides/game-design-deckbuilder/run-pacing-3-act-structure/{guide.md, expectations.md, tasks/task.md, demo/RunActConfig.cs, negative-demo/RunActConfig.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/game-design-deckbuilder/run-pacing-3-act-structure/guide.md`:

```markdown
---
id: run-pacing-3-act-structure
category: game-design-deckbuilder
title: Three-act run pacing for roguelite deckbuilders
description: Structure a roguelite run as three escalating acts with distinct difficulty curves, encounter pools, and rest beats. Avoids the "flat difficulty" trap.
useCases:
  - "pace a roguelite run"
  - "design encounter progression"
  - "Slay the Spire style act structure"
  - "deckbuilder difficulty curve"
  - "rest sites and elite encounters"
relatedGuides: []
appliesTo:
  - "any single-run roguelite or deckbuilder with a fixed-length progression"
---

# Three-act run pacing

Successful roguelite deckbuilders (Slay the Spire, Monster Train, Inscryption) share a near-universal pacing structure: a single run is broken into 3 escalating **acts**, each with distinct content pools and a recognizable rhythm. The structure exists because:

1. **Buildcraft phases need difficulty rest beats.** A flat curve denies the player time to draft and feel their build.
2. **Act boundaries are bookmarks.** Players remember "I died on Act 2's boss" as a memory beat.
3. **Pool resets keep encounters fresh.** Act 1 enemies overstay their welcome by Act 3.

## Canonical 3-act shape

| Act | Encounters | Elites | Bosses | Rest opportunities |
|---|---|---|---|---|
| 1 (intro) | ~6–8 easy fights | 1–2 mid-act | 1 boss | 1–2 rest sites |
| 2 (mid) | ~8–10 fights of increased complexity | 2–3 elites | 1 boss | 2 rest sites |
| 3 (climax) | ~6–8 hard fights | 2 elites | Final boss | 1 rest site |

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "RunActConfig", menuName = "Game/Run Act Config")]
public class RunActConfig : ScriptableObject
{
    [System.Serializable]
    public class Act
    {
        public int normalEncounterCount = 7;
        public int eliteCount = 2;
        public int restSiteCount = 2;
        public bool endsInBoss = true;
    }

    public Act act1 = new Act { normalEncounterCount = 7, eliteCount = 1, restSiteCount = 2 };
    public Act act2 = new Act { normalEncounterCount = 9, eliteCount = 3, restSiteCount = 2 };
    public Act act3 = new Act { normalEncounterCount = 7, eliteCount = 2, restSiteCount = 1 };
}
```

## Avoid

- **Single flat encounter list.** Players burn out on Act 1 enemies by encounter 15.
- **Act 3 with rest sites equal to or greater than Act 2.** Climax acts should withhold rest to build tension.
- **No elite encounters.** Elites are the buildcraft check that separates "this build is working" from "lucky draft." Without them, the run feels lottery-driven.

## Gotchas

- Rest sites should be both healing AND upgrade — a single-purpose rest leaves players who don't need that purpose with a dead beat.
- Boss encounters should drop the highest tier of rewards but also have run-defining drawbacks (e.g., relic + curse, big heal but lose a card).
- The number of choices at each node (typically 2–3) matters more than the count of nodes; over-branching dilutes consequence.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/game-design-deckbuilder/run-pacing-3-act-structure/expectations.md`:

```markdown
# Expectations: run-pacing-3-act-structure

After applying this guide, the agent's `Assets/Scripts/RunActConfig.cs` should:

1. Be a `ScriptableObject` with a `[CreateAssetMenu]` attribute.
2. Declare exactly 3 act fields (e.g. `act1`, `act2`, `act3`).
3. Each act should declare `normalEncounterCount`, `eliteCount`, and `restSiteCount` (or equivalent integer fields).
4. Act 2's elite count should be greater than Act 1's elite count (escalation).
5. Act 3's rest-site count should be <= Act 2's rest-site count (climax withholds rest).
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/game-design-deckbuilder/run-pacing-3-act-structure/tasks/task.md`:

```markdown
# Task

Implement `Assets/Scripts/RunActConfig.cs` as a ScriptableObject describing a 3-act roguelite run. Each act has counts for normal encounters, elites, and rest sites. Configure default values so:
- Act 1 has 1 elite.
- Act 2 has 3 elites (more than act 1).
- Act 2 has 2 rest sites; Act 3 has 1 rest site (fewer than act 2).
```

- [ ] **Step 4: Create `demo/RunActConfig.cs`**

`guides/game-design-deckbuilder/run-pacing-3-act-structure/demo/RunActConfig.cs`:

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "RunActConfig", menuName = "Game/Run Act Config")]
public class RunActConfig : ScriptableObject
{
    [System.Serializable]
    public class Act
    {
        public int normalEncounterCount = 7;
        public int eliteCount = 2;
        public int restSiteCount = 2;
    }

    public Act act1 = new Act { normalEncounterCount = 7, eliteCount = 1, restSiteCount = 2 };
    public Act act2 = new Act { normalEncounterCount = 9, eliteCount = 3, restSiteCount = 2 };
    public Act act3 = new Act { normalEncounterCount = 7, eliteCount = 2, restSiteCount = 1 };
}
```

- [ ] **Step 5: Create `negative-demo/RunActConfig.cs`**

`guides/game-design-deckbuilder/run-pacing-3-act-structure/negative-demo/RunActConfig.cs`:

```csharp
using UnityEngine;

public class RunActConfig : MonoBehaviour
{
    public int totalEncounters = 25; // flat list — no acts
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/game-design-deckbuilder/run-pacing-3-act-structure/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RunActConfig.cs');
const src = readCSharp(TARGET);

test('extends ScriptableObject', () => {
  assert.ok(hasPattern(src, /:\s*ScriptableObject\b/));
});

test('has CreateAssetMenu attribute', () => {
  assert.ok(hasPattern(src, /\[CreateAssetMenu\b/));
});

test('declares 3 act fields (act1, act2, act3)', () => {
  assert.ok(hasPattern(src, /\bact1\b/));
  assert.ok(hasPattern(src, /\bact2\b/));
  assert.ok(hasPattern(src, /\bact3\b/));
});

test('each act type has normalEncounterCount, eliteCount, restSiteCount', () => {
  assert.ok(hasPattern(src, /\bnormalEncounterCount\b/));
  assert.ok(hasPattern(src, /\beliteCount\b/));
  assert.ok(hasPattern(src, /\brestSiteCount\b/));
});

test('act2 eliteCount > act1 eliteCount (escalation)', () => {
  const a1 = src.match(/act1\s*=[\s\S]*?eliteCount\s*=\s*(\d+)/);
  const a2 = src.match(/act2\s*=[\s\S]*?eliteCount\s*=\s*(\d+)/);
  assert.ok(a1 && a2, 'expected eliteCount literals on act1 and act2');
  assert.ok(parseInt(a2![1], 10) > parseInt(a1![1], 10),
    `expected act2.eliteCount (${a2![1]}) > act1.eliteCount (${a1![1]})`);
});

test('act3 restSiteCount <= act2 restSiteCount (climax withholds rest)', () => {
  const a2 = src.match(/act2\s*=[\s\S]*?restSiteCount\s*=\s*(\d+)/);
  const a3 = src.match(/act3\s*=[\s\S]*?restSiteCount\s*=\s*(\d+)/);
  assert.ok(a2 && a3, 'expected restSiteCount literals on act2 and act3');
  assert.ok(parseInt(a3![1], 10) <= parseInt(a2![1], 10),
    `expected act3.restSiteCount (${a3![1]}) <= act2.restSiteCount (${a2![1]})`);
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-deckbuilder/run-pacing-3-act-structure/grader.ts
TARGET_FILE=$(pwd)/guides/game-design-deckbuilder/run-pacing-3-act-structure/negative-demo/RunActConfig.cs \
  node --experimental-strip-types --test guides/game-design-deckbuilder/run-pacing-3-act-structure/grader.ts
```
Expected: demo 6/6; negative-demo fails at least 4 (not ScriptableObject, no CreateAssetMenu, no act fields, no count fields).

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-deckbuilder/
git commit -m "feat(guides): add run-pacing-3-act-structure guide + grader"
```

---

## Task 13: `card-rarity-without-power-creep`

**Files:**
- Create: `guides/game-design-deckbuilder/card-rarity-without-power-creep/{guide.md, expectations.md, tasks/task.md, demo/CardData.cs, negative-demo/CardData.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/game-design-deckbuilder/card-rarity-without-power-creep/guide.md`:

```markdown
---
id: card-rarity-without-power-creep
category: game-design-deckbuilder
title: Card rarity as effect breadth, not raw power
description: Use rarity to gate complexity and conditional power, not to scale raw numbers. Prevents the late-game "obvious correct pick" trap.
useCases:
  - "design card rarity tiers"
  - "avoid power creep in card games"
  - "common vs rare card design"
  - "balance deckbuilder card pools"
  - "build-defining rare cards"
relatedGuides:
  - run-pacing-3-act-structure
appliesTo:
  - "any deckbuilder with multiple rarity tiers"
---

# Card rarity as effect breadth, not raw power

The naive rarity model — "rare = bigger numbers" — degenerates into solved decks: in any deck, the rare cards are always correct picks, and the common cards become filler. The interesting model is **rarity as effect breadth**: commons do one clean thing; rares do *more things*, do conditional things, or change other cards' behavior.

The deck's identity should come from rares (build-defining synergies), but commons should remain mathematically competitive in their slot.

## Pattern

```csharp
using UnityEngine;

public enum CardRarity { Common, Uncommon, Rare }

[CreateAssetMenu(fileName = "Card", menuName = "Game/Card")]
public class CardData : ScriptableObject
{
    public string cardName;
    public CardRarity rarity = CardRarity.Common;
    public int energyCost = 1;
    public int baseDamage = 6;
    // Effects modify the card with conditionals / synergies (length grows with rarity).
    public string[] effects;
}
```

By convention:
- **Common**: 0–1 effects. Tight cost-to-value.
- **Uncommon**: 1–2 effects, often a small synergy hook ("if X, do Y").
- **Rare**: 2–3 effects, build-defining ("whenever you play a Skill, draw a card").

Notice: `baseDamage` need not scale with rarity. A common Strike at 6 damage may remain efficient cost-per-damage across the whole game.

## Avoid

- **Stat-only rarity ladders** (common = 6dmg, uncommon = 9dmg, rare = 12dmg). Solved decks: always pick the higher tier.
- **Rares that are strictly better than commons.** A rare should be *different*, not bigger.
- **Effects that snowball without cost.** Build-defining is good; "every other card I draw also draws a card" without a downside is not.

## Gotchas

- Test your common pool in isolation: a deck made of only commons should still complete an Act 1 boss. If commons can't carry a run, the rarity gradient is too steep.
- The `effects` array length growing with rarity is a useful invariant but only when the effects are *qualitatively* different (conditional, synergistic). Three trivial effects is worse than one good one.
- Card slots should fill faster than rares appear, so most decks have many commons. If rares come too fast, common cards become permanent dead weight.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/game-design-deckbuilder/card-rarity-without-power-creep/expectations.md`:

```markdown
# Expectations: card-rarity-without-power-creep

After applying this guide, the agent's `Assets/Scripts/CardData.cs` should:

1. Define a `CardRarity` enum with at least `Common`, `Uncommon`, `Rare` values.
2. `CardData` should be a `ScriptableObject` with `[CreateAssetMenu]`.
3. Declare a `rarity` field of type `CardRarity`.
4. Declare a `baseDamage` (or similar core-stat) field that is NOT a function of rarity (no `if (rarity == Rare) baseDamage *= 2` logic).
5. Declare an `effects` array (or list) field — rarity gates breadth, not raw stats.
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/game-design-deckbuilder/card-rarity-without-power-creep/tasks/task.md`:

```markdown
# Task

Implement `Assets/Scripts/CardData.cs` as a ScriptableObject describing a card. Include a `CardRarity` enum (Common, Uncommon, Rare), a `rarity` field, a `baseDamage` field (NOT scaled by rarity — keep raw power flat), and an `effects` array (string for now — effect breadth scales with rarity, not damage numbers).
```

- [ ] **Step 4: Create `demo/CardData.cs`**

`guides/game-design-deckbuilder/card-rarity-without-power-creep/demo/CardData.cs`:

```csharp
using UnityEngine;

public enum CardRarity { Common, Uncommon, Rare }

[CreateAssetMenu(fileName = "Card", menuName = "Game/Card")]
public class CardData : ScriptableObject
{
    public string cardName;
    public CardRarity rarity = CardRarity.Common;
    public int energyCost = 1;
    public int baseDamage = 6;
    public string[] effects;
}
```

- [ ] **Step 5: Create `negative-demo/CardData.cs`**

`guides/game-design-deckbuilder/card-rarity-without-power-creep/negative-demo/CardData.cs`:

```csharp
using UnityEngine;

public enum CardRarity { Common, Uncommon, Rare }

[CreateAssetMenu(fileName = "Card", menuName = "Game/Card")]
public class CardData : ScriptableObject
{
    public string cardName;
    public CardRarity rarity;
    public int baseDamage = 6;

    // Power-creep: damage scales with rarity. Solved deck — always pick rares.
    public int Damage => rarity == CardRarity.Rare ? baseDamage * 2
                       : rarity == CardRarity.Uncommon ? baseDamage + 3
                       : baseDamage;
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/game-design-deckbuilder/card-rarity-without-power-creep/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'CardData.cs');
const src = readCSharp(TARGET);

test('declares CardRarity enum with Common, Uncommon, Rare', () => {
  assert.ok(hasPattern(src, /\benum\s+CardRarity\b/));
  assert.ok(hasPattern(src, /\bCommon\b/));
  assert.ok(hasPattern(src, /\bUncommon\b/));
  assert.ok(hasPattern(src, /\bRare\b/));
});

test('CardData extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(src, /CardData\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(src, /\[CreateAssetMenu\b/));
});

test('has a rarity field of type CardRarity', () => {
  assert.ok(hasPattern(src, /\bCardRarity\s+rarity\b/));
});

test('has a baseDamage field', () => {
  assert.ok(hasPattern(src, /\bint\s+baseDamage\b/));
});

test('damage is NOT scaled by rarity in the source', () => {
  // No `rarity == CardRarity.Rare` followed by damage arithmetic.
  assert.ok(hasNoPattern(src, /rarity\s*==\s*CardRarity\.(Rare|Uncommon)[\s\S]{0,80}?baseDamage\s*[*+]/));
});

test('has an effects array/list field', () => {
  assert.ok(hasPattern(src, /\b(string\[\]|List<\w+>)\s+effects\b/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-deckbuilder/card-rarity-without-power-creep/grader.ts
TARGET_FILE=$(pwd)/guides/game-design-deckbuilder/card-rarity-without-power-creep/negative-demo/CardData.cs \
  node --experimental-strip-types --test guides/game-design-deckbuilder/card-rarity-without-power-creep/grader.ts
```
Expected: demo 6/6; negative-demo fails at least 2 (damage scaled by rarity; no effects array).

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-deckbuilder/card-rarity-without-power-creep/
git commit -m "feat(guides): add card-rarity-without-power-creep guide + grader"
```

---

## Task 14: `relic-stacking-readability`

**Files:**
- Create: `guides/game-design-deckbuilder/relic-stacking-readability/{guide.md, expectations.md, tasks/task.md, demo/RelicData.cs, negative-demo/RelicData.cs, grader.ts}`

- [ ] **Step 1: Create `guide.md`**

`guides/game-design-deckbuilder/relic-stacking-readability/guide.md`:

```markdown
---
id: relic-stacking-readability
category: game-design-deckbuilder
title: Keep stacked relic effects legible to the player
description: Design passive items (relics, artifacts, perks) so the *combined* effect of multiple stacked relics is still legible. Use explicit hook names and limit per-relic effect count.
useCases:
  - "design relics for a roguelite"
  - "make stacked passive effects readable"
  - "Slay the Spire relic design"
  - "limit number of effects per relic"
  - "tooltip clarity for permanent items"
---

# Keep stacked relic effects legible

A deckbuilder's relic system is its passive synergy layer — and its biggest readability risk. By Act 3 a player may have 12 stacked relics, each with one or more triggers. If those triggers are arbitrary, the player can no longer predict what their deck does, and the game devolves into watching numbers fly.

The fix is twofold:
1. **Each relic names its hook explicitly** (`OnTurnStart`, `OnDamageTaken`, `OnCardPlayed`).
2. **Cap effects per relic to 1** in most cases. Only build-defining "boss relics" should have 2.

This keeps any individual tooltip readable and makes the union of stacked effects predictable.

## Pattern

```csharp
using UnityEngine;

public enum RelicHook { OnTurnStart, OnDamageTaken, OnCardPlayed, OnRest, OnRoomCleared }

[CreateAssetMenu(fileName = "Relic", menuName = "Game/Relic")]
public class RelicData : ScriptableObject
{
    public string relicName;
    public RelicHook hook;
    [TextArea] public string tooltip;
    // Single effect by convention. Multi-effect relics are reserved for boss tier.
    public int effectMagnitude = 1;
}
```

## Avoid

- Untyped "do-anything" relics whose tooltip is a paragraph.
- Relics with 3+ effects each (the multi-card tooltip readability problem).
- Relics whose effect depends on another relic being equipped (combinatorial tooltip explosion).
- Silent triggers (effect happens, no visual cue or log entry). Players who can't see the trigger think the relic is broken.

## Gotchas

- Provide a UI panel that groups relics by `hook` — players read "what triggers on damage taken" much faster than reading 12 individual tooltips.
- Boss-tier relics with 2 effects should also have a downside (curse a card, take +5% damage). Pure upside escalates power creep.
- For relics that scale per-encounter (`+1 strength per enemy killed`), surface the current accumulated value in the tooltip at all times.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/game-design-deckbuilder/relic-stacking-readability/expectations.md`:

```markdown
# Expectations: relic-stacking-readability

After applying this guide, the agent's `Assets/Scripts/RelicData.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Define a `RelicHook` enum naming explicit trigger points (at least `OnTurnStart`, `OnDamageTaken`, `OnCardPlayed`).
3. Have a `hook` field of type `RelicHook`.
4. Have a `tooltip` string field (so players can read what it does).
5. NOT have arrays of effects — single-effect-per-relic by convention.
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/game-design-deckbuilder/relic-stacking-readability/tasks/task.md`:

```markdown
# Task

Implement `Assets/Scripts/RelicData.cs` as a ScriptableObject. Include a `RelicHook` enum (with at least `OnTurnStart`, `OnDamageTaken`, `OnCardPlayed`), a `hook` field, a `tooltip` string field (with `[TextArea]`), and a single `effectMagnitude` (int). Do NOT add an array of effects — the guide's principle is "one effect per relic" for readability.
```

- [ ] **Step 4: Create `demo/RelicData.cs`**

`guides/game-design-deckbuilder/relic-stacking-readability/demo/RelicData.cs`:

```csharp
using UnityEngine;

public enum RelicHook { OnTurnStart, OnDamageTaken, OnCardPlayed, OnRest, OnRoomCleared }

[CreateAssetMenu(fileName = "Relic", menuName = "Game/Relic")]
public class RelicData : ScriptableObject
{
    public string relicName;
    public RelicHook hook;
    [TextArea] public string tooltip;
    public int effectMagnitude = 1;
}
```

- [ ] **Step 5: Create `negative-demo/RelicData.cs`**

`guides/game-design-deckbuilder/relic-stacking-readability/negative-demo/RelicData.cs`:

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "Relic", menuName = "Game/Relic")]
public class RelicData : ScriptableObject
{
    public string relicName;
    public string description; // untyped "do anything" tooltip
    // 5 unrelated effect knobs => unreadable combined tooltip
    public int onTurnStartBonus;
    public int onDamageTakenReduction;
    public float onCardPlayedScaling;
    public int onRestHealing;
    public int onRoomClearedGold;
}
```

- [ ] **Step 6: Create `grader.ts`**

`guides/game-design-deckbuilder/relic-stacking-readability/grader.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'RelicData.cs');
const src = readCSharp(TARGET);

test('extends ScriptableObject with CreateAssetMenu', () => {
  assert.ok(hasPattern(src, /RelicData\s*:\s*ScriptableObject/));
  assert.ok(hasPattern(src, /\[CreateAssetMenu\b/));
});

test('defines RelicHook enum with OnTurnStart, OnDamageTaken, OnCardPlayed', () => {
  assert.ok(hasPattern(src, /\benum\s+RelicHook\b/));
  assert.ok(hasPattern(src, /\bOnTurnStart\b/));
  assert.ok(hasPattern(src, /\bOnDamageTaken\b/));
  assert.ok(hasPattern(src, /\bOnCardPlayed\b/));
});

test('has a hook field of type RelicHook', () => {
  assert.ok(hasPattern(src, /\bRelicHook\s+hook\b/));
});

test('has a tooltip string field', () => {
  assert.ok(hasPattern(src, /\bstring\s+tooltip\b/));
});

test('no arrays of effects (single-effect convention)', () => {
  assert.ok(hasNoPattern(src, /\b(string|int|float|RelicHook)\[\]\s+\w*[Ee]ffect/));
  assert.ok(hasNoPattern(src, /\bList<\w+>\s+effects\b/));
});
```

- [ ] **Step 7: Calibrate**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/game-design-deckbuilder/relic-stacking-readability/grader.ts
TARGET_FILE=$(pwd)/guides/game-design-deckbuilder/relic-stacking-readability/negative-demo/RelicData.cs \
  node --experimental-strip-types --test guides/game-design-deckbuilder/relic-stacking-readability/grader.ts
```
Expected: demo 5/5; negative-demo fails at least 3 (no RelicHook enum, no hook field, no tooltip field; the negative has 5 effect knobs which violates the single-effect convention).

- [ ] **Step 8: Commit**

```bash
git add guides/game-design-deckbuilder/relic-stacking-readability/
git commit -m "feat(guides): add relic-stacking-readability guide + grader"
```

---

## Task 15: Refresh corpus + run all graders

After all 12 guides are in place, regenerate the serving corpus and verify every grader passes against its own demo + fails against its own negative-demo.

**Files:**
- Modify: `serving/lib/use-cases.gen.ts` (regenerated)
- Modify: `serving/lib/embeddings.gen.bin` (regenerated)

- [ ] **Step 1: Refresh the corpus**

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types scripts/build-guides.ts
```
Expected: prints `Built N use cases from 12 guide(s) into ...`. N should be ~55–65 (12 guides × ~5 useCases each).

- [ ] **Step 2: Verify the corpus**

```bash
head -3 serving/lib/use-cases.gen.ts
ls -la serving/lib/embeddings.gen.bin
```
Expected: catalog file contains entries for all 12 guide ids; bin file size = 8 + N×384×4 bytes.

- [ ] **Step 3: Run every grader against its demo (smoke check)**

```bash
cd /Users/lijinglue/repo/ggdd
for g in guides/*/*/grader.ts; do
  echo "=== $g ==="
  node --experimental-strip-types --test "$g" 2>&1 | tail -3
done
```
Expected: every grader prints `pass N\nfail 0`.

- [ ] **Step 4: Run every grader against its negative-demo (calibration check)**

```bash
cd /Users/lijinglue/repo/ggdd
for g in guides/*/*/grader.ts; do
  dir=$(dirname "$g")
  # Find the negative-demo file (first .cs under negative-demo/)
  neg=$(ls "$dir"/negative-demo/*.cs 2>/dev/null | head -1)
  if [ -z "$neg" ]; then echo "SKIP $g (no negative-demo)"; continue; fi
  echo "=== $g (negative: $neg) ==="
  TARGET_FILE="$neg" node --experimental-strip-types --test "$g" 2>&1 | grep -E "^# (pass|fail)" | head -2
done
```
Expected: every grader reports `fail >= 1` (the negative demos legitimately fail at least one assertion).

If any grader passes its own negative-demo, FIX IT before proceeding — that grader is broken.

- [ ] **Step 5: Run a CLI smoke test against the new corpus**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types serving/bin/ggdd.ts search "object pooling" | head -50
node --experimental-strip-types serving/bin/ggdd.ts search "hit feel weighty" | head -20
node --experimental-strip-types serving/bin/ggdd.ts list | grep -c '"id"'
```
Expected:
- "object pooling" → top result is `object-pooling-basics`
- "hit feel weighty" → top result is `hit-stop-on-impact`
- list count = 12

- [ ] **Step 6: Commit the regenerated corpus**

```bash
git add serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin
git commit -m "feat(serving): regenerate corpus from 12 seeded guides"
```

---

## Task 16: Preflight + CONTEXT.md update + tag

**Files:**
- Modify: `CONTEXT.md`

- [ ] **Step 1: Update `CONTEXT.md`**

Open `CONTEXT.md` and update the "Top-level layout" entry for `guides/` and the active TODOs.

Replace:
```
- `guides/` — guide content (Plan 2). One directory per guide under `guides/<category>/<guide-id>/`.
```

With:
```
- `guides/` — guide content. 12 guides seeded across `unity-engine`, `unity-performance`, `game-design-action`, `game-design-deckbuilder` (Plan 2). Each guide directory has `guide.md`, `expectations.md`, `demo/<files>.cs`, `negative-demo/<files>.cs`, `tasks/task.md`, `grader.ts`. Plan 3 adds the `ggdd-dev` authoring CLI; Plan 4 adds Unity batch grading via the harness.
```

Append to the "Active TODOs" section:
```
- **Static-only graders.** All Plan 2 graders use static C# analysis only. Unity batch-mode helpers (`unityCompile`, `unityRunEditModeTests`) become available in Plan 4 when the harness lands; some guides may then be revised to `gradeMode: static+unity`.
- **Game-design grader rigor.** Per spec §8.3 item 5, design-pattern graders (hit-stop, knockback, run pacing, rarity, relic readability) are inherently fuzzier than perf graders. Initial graders will under-detect; iterate based on real eval data once Plan 4 ships.
```

- [ ] **Step 2: Run the preflight equivalent**

```bash
cd /Users/lijinglue/repo/ggdd
# Root tests (lib/)
node --experimental-strip-types --test 'lib/**/*.test.ts'
# Serving tests
cd serving && node --experimental-strip-types --test --test-timeout 60000 'lib/**/*.test.ts' 'bin/**/*.test.ts' 'mcp-server/**/*.test.ts' 'scripts/**/*.test.ts' 'skills-cli/**/*.test.ts'
# Guides tests (test-fixture + all graders against their own demos)
cd .. && node --experimental-strip-types --test guides/test-fixture.test.ts
for g in guides/*/*/grader.ts; do
  node --experimental-strip-types --test "$g" 2>&1 | tail -3
done
# esbuild bundler smoke
cd serving && node --experimental-strip-types skills-cli/build-dist.ts
node build/ggdd.js search "input system" | head -c 60
```

Expected: all tests pass; bundler outputs both files; bundled `ggdd.js` search starts with `[`.

- [ ] **Step 3: Commit + tag**

```bash
cd /Users/lijinglue/repo/ggdd
git add CONTEXT.md
git commit -m "docs: update CONTEXT.md with Plan 2 guide content + grader scope notes"
git tag v0.2.0-plan2
git log --oneline | head -10
```

Confirm the tag points at the docs commit and the branch has ~16 new commits since the Plan 1 merge (`d122a4e`).

---

## Plan 2 acceptance checks

After all tasks complete:

- [ ] `find guides -name guide.md | wc -l` → `12`
- [ ] `find guides -name grader.ts | wc -l` → `12`
- [ ] Every grader passes against its own `demo/*.cs`
- [ ] Every grader fails ≥1 assertion against its own `negative-demo/*.cs`
- [ ] `node --experimental-strip-types serving/bin/ggdd.ts list | grep -c '"id"'` → `12`
- [ ] `node --experimental-strip-types serving/bin/ggdd.ts search "object pooling"` → top result `object-pooling-basics`
- [ ] `node --experimental-strip-types serving/bin/ggdd.ts search "photosynthesis chlorophyll plant biology"` → empty array (similarity threshold filtered)
- [ ] `node serving/build/ggdd.js search "input"` → starts with `[`, no stdout preamble
- [ ] Tag `v0.2.0-plan2` exists

---

## Out of scope for Plan 2 (lands in later plans)

- **Plan 3:** `ggdd-dev` authoring CLI (`audit`, `dev <guide>`, `gen-grader`, `gen-negative`, `test-grader` — automating the per-task calibration that we did manually here).
- **Plan 4:** Eval harness with Unity 6 base-apps (committed via git LFS); `unityCompile` / `unityRunEditModeTests` helpers; agent runners.
- **Plan 5:** `eval-view/` dashboard.
- **Plan 6:** npm publish flow + Claude Code plugin marketplace registration.

---

## Self-review notes

- **Spec coverage:** all 12 spec-listed guide ids are written; `test-fixture.ts` shipped with the static helpers required by spec §5.3 (excluding the `unity*` helpers, deferred to Plan 4); similarity-threshold PR follow-up addressed in Task 2.
- **No placeholders:** every grader, demo, negative-demo, and guide body is concrete; no TODOs in source.
- **Type consistency:** `CardRarity`, `RelicHook`, `RunActConfig.Act`, `InputBuffer.bufferedAt` etc. are defined and referenced consistently within each guide. Test-fixture helper names (`readCSharp`, `hasPattern`, `hasNoPattern`, `usesNamespace`, `declaresType`, `methodCallsAst`, `serializedAssetField`) are consistent across all 12 grader files and the test-fixture test.
- **Calibration:** every guide task ends with a manual "run grader against demo (must pass) and negative-demo (must fail)" check. Plan 3 will automate this as part of the `dev` pipeline.
