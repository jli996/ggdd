# ggdd Plan 7d — Unity Engine Additions (3 guides: Cinemachine, UI Toolkit, Netcode)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Add 3 Unity engine API guides to the existing `unity-engine` category. Brings corpus 48 → 51 guides. Schema unchanged (these go into existing `unity-engine` category).

**Tech Stack:** Same as Plan 7a/b/c. Use npm.

**Branch:** `feature/plan-7d-unity-engine-additions` (off `main`, after PR #9).

These are Unity API guides (not game-design pattern guides) — the demos use actual Unity 6 APIs and the graders check for those APIs + warn against legacy alternatives.

---

## Task 1: `unity-engine/cinemachine-3-cameras`

**Files:** `guides/unity-engine/cinemachine-3-cameras/{guide.md, expectations.md, tasks/task.md, demo/PlayerCamera.cs, negative-demo/PlayerCamera.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: cinemachine-3-cameras
category: unity-engine
title: Cinemachine 3 cameras (Unity 6 default)
description: Use Cinemachine 3's `CinemachineCamera` (Unity.Cinemachine namespace) for virtual cameras. Cinemachine 2's `CinemachineVirtualCamera` is legacy in Unity 6 — migrate if your project still uses it.
useCases:
  - "set up camera with Cinemachine 3 in Unity 6"
  - "CinemachineCamera vs CinemachineVirtualCamera"
  - "Unity.Cinemachine namespace"
  - "camera blending with Cinemachine"
  - "migrate from Cinemachine 2 to 3"
relatedGuides: []
appliesTo:
  - "any Unity 6 project using virtual cameras or camera blending"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Cinemachine 3 cameras (Unity 6 default)

Cinemachine 3 is a major API rewrite from CM2, and is the Unity 6 default. The two versions are NOT interoperable:

| Concern | CM2 (legacy) | CM3 (modern, Unity 6 default) |
|---|---|---|
| Namespace | `Cinemachine` | `Unity.Cinemachine` |
| Virtual camera | `CinemachineVirtualCamera` | `CinemachineCamera` |
| Pipeline | pipeline stages (Body/Aim/Noise/Finalize) | individual components attached to the GameObject |
| Brain | `CinemachineBrain` (same name, evolved) | `CinemachineBrain` |

A Unity 6 project starting fresh should use CM3. A project on CM2 should migrate via the Unity Cinemachine Upgrader window.

## Use CinemachineCamera (CM3)

```csharp
using UnityEngine;
using Unity.Cinemachine;

public class PlayerCamera : MonoBehaviour
{
    [SerializeField] private CinemachineCamera followCam;
    [SerializeField] private CinemachineCamera aimCam;
    [SerializeField] private Transform target;

    void Start()
    {
        followCam.Target.TrackingTarget = target;
        followCam.Priority = 10;
        aimCam.Priority = 5;
    }

    public void EnterAimMode()
    {
        // Higher priority wins.
        followCam.Priority = 5;
        aimCam.Priority = 15;
    }
}
```

## Avoid

- `using Cinemachine;` (CM2 namespace) — replace with `using Unity.Cinemachine;`.
- `CinemachineVirtualCamera` (CM2 type) — replace with `CinemachineCamera`.
- Hand-coding `Camera.transform = ...` to switch viewpoints — that bypasses CM3's blending and breaks camera-aware features.
- Mixing CM2 and CM3 in the same project — they don't coexist cleanly; upgrade the whole project.

## Gotchas

- Migration: Window → Cinemachine → Upgrader. It auto-converts most assets but check serialized references.
- `CinemachineCamera.Priority` is an int; higher wins. Set priorities explicitly rather than relying on Unity component order.
- `CinemachineBrain` lives on the `Camera`, not on the virtual cameras. Don't add multiple Brains.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: cinemachine-3-cameras

After applying this guide, the agent's `Assets/Scripts/PlayerCamera.cs` should:

1. Import `Unity.Cinemachine` (CM3 namespace).
2. NOT import `Cinemachine` (CM2 namespace).
3. Declare `CinemachineCamera` field(s) — NOT `CinemachineVirtualCamera` (CM2 type).
4. NOT manipulate `Camera.transform` to switch cameras (use Priority instead).
5. Use `.Priority` to control which camera is active.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

`Assets/Scripts/PlayerCamera.cs` currently uses CM2's `Cinemachine` namespace and `CinemachineVirtualCamera`. Migrate it to Cinemachine 3:
- `using Cinemachine;` → `using Unity.Cinemachine;`
- `CinemachineVirtualCamera` → `CinemachineCamera`
- Use `.Priority` to switch between follow / aim cameras (no `Camera.transform` manipulation).
```

- [ ] **Step 4: `demo/PlayerCamera.cs`**

```csharp
using UnityEngine;
using Unity.Cinemachine;

public class PlayerCamera : MonoBehaviour
{
    [SerializeField] private CinemachineCamera followCam;
    [SerializeField] private CinemachineCamera aimCam;
    [SerializeField] private Transform target;

    void Start()
    {
        followCam.Target.TrackingTarget = target;
        followCam.Priority = 10;
        aimCam.Priority = 5;
    }

    public void EnterAimMode()
    {
        followCam.Priority = 5;
        aimCam.Priority = 15;
    }
}
```

- [ ] **Step 5: `negative-demo/PlayerCamera.cs`**

```csharp
using UnityEngine;
using Cinemachine;  // CM2 legacy namespace

public class PlayerCamera : MonoBehaviour
{
    [SerializeField] private CinemachineVirtualCamera followCam;  // CM2 type
    [SerializeField] private Camera mainCam;

    public void EnterAimMode()
    {
        // Anti-pattern: hand-coded camera switch.
        mainCam.transform.position = followCam.transform.position;
        mainCam.transform.rotation = followCam.transform.rotation;
    }
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PlayerCamera.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('imports Unity.Cinemachine (CM3 namespace)', () => {
  assert.ok(usesNamespace(codeOnly, 'Unity.Cinemachine'));
});

test('does NOT import legacy Cinemachine (CM2 namespace)', () => {
  // The Cinemachine 2 import is `using Cinemachine;` (NOT Unity.Cinemachine).
  // A targeted regex catches that exact pattern without false-positives.
  assert.ok(hasNoPattern(codeOnly, /\busing\s+Cinemachine\s*;/));
});

test('uses CinemachineCamera type (CM3), not CinemachineVirtualCamera (CM2)', () => {
  assert.ok(hasPattern(codeOnly, /\bCinemachineCamera\b/));
  assert.ok(hasNoPattern(codeOnly, /\bCinemachineVirtualCamera\b/));
});

test('uses Priority to control camera switching (not transform manipulation)', () => {
  assert.ok(hasPattern(codeOnly, /\.Priority\s*=/));
});

test('does NOT manipulate Camera.transform directly', () => {
  assert.ok(hasNoPattern(codeOnly, /\b\w*[Cc]am\w*\.transform\.position\s*=/));
  assert.ok(hasNoPattern(codeOnly, /\b\w*[Cc]am\w*\.transform\.rotation\s*=/));
});
```

- [ ] **Step 7: Calibrate + commit**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-engine/cinemachine-3-cameras/grader.ts 2>&1 | tail -3
TARGET_FILE=$(pwd)/guides/unity-engine/cinemachine-3-cameras/negative-demo/PlayerCamera.cs \
  node --experimental-strip-types --test guides/unity-engine/cinemachine-3-cameras/grader.ts 2>&1 | tail -3
git add guides/unity-engine/cinemachine-3-cameras/
git commit -m "feat(guides): add cinemachine-3-cameras guide + grader"
```
Expected: demo 5/5; negative-demo fails ≥4.

---

## Task 2: `unity-engine/ui-toolkit-over-ugui`

**Files:** `guides/unity-engine/ui-toolkit-over-ugui/{guide.md, expectations.md, tasks/task.md, demo/MainMenu.cs, negative-demo/MainMenu.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: ui-toolkit-over-ugui
category: unity-engine
title: UI Toolkit over uGUI (Unity 6 modern UI)
description: For new runtime and editor UI in Unity 6, use UI Toolkit (UXML/USS + UIElements). uGUI (Canvas + Text + Button MonoBehaviours) remains for world-space UI and legacy projects.
useCases:
  - "modern UI in Unity 6"
  - "UI Toolkit vs uGUI"
  - "UXML and USS for Unity UI"
  - "replace Canvas with UIDocument"
  - "runtime UI without GameObjects"
relatedGuides: []
appliesTo:
  - "any Unity 6 project building new runtime UI (menus, HUDs, editor tools)"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# UI Toolkit over uGUI

Unity 6 has two UI systems:

- **UI Toolkit** (`UnityEngine.UIElements`): markup (UXML) + styling (USS) + runtime via `UIDocument`. Web-developer-friendly. Recommended for new menus, HUDs, settings screens, and ALL editor UI.
- **uGUI** (`UnityEngine.UI`): GameObject + Canvas + Text/Image/Button MonoBehaviours. Recommended only for world-space UI (nameplates floating in 3D space) and legacy projects.

## Use UI Toolkit for new menus

```csharp
using UnityEngine;
using UnityEngine.UIElements;

public class MainMenu : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument;
    private Button playButton;
    private Button settingsButton;

    void OnEnable()
    {
        var root = uiDocument.rootVisualElement;
        playButton = root.Q<Button>("play-button");
        settingsButton = root.Q<Button>("settings-button");
        playButton.clicked += OnPlayClicked;
        settingsButton.clicked += OnSettingsClicked;
    }

    void OnDisable()
    {
        if (playButton != null) playButton.clicked -= OnPlayClicked;
        if (settingsButton != null) settingsButton.clicked -= OnSettingsClicked;
    }

    private void OnPlayClicked() { /* ... */ }
    private void OnSettingsClicked() { /* ... */ }
}
```

The UI itself lives in a `.uxml` file referenced by the `UIDocument` component.

## Avoid

- `using UnityEngine.UI;` for new menus — that's uGUI (legacy for screen UI in Unity 6).
- `GetComponent<Button>()` on a Canvas-attached GameObject (uGUI). Use `root.Q<Button>("name")` (UI Toolkit) instead.
- `Text.text = "..."` (uGUI). Use `Label.text = "..."` (UI Toolkit).
- A scene full of UI GameObjects for screen UI. A `UIDocument` is one GameObject; the UI tree lives in UXML.

## Gotchas

- UI Toolkit's `Button` is `UnityEngine.UIElements.Button`, distinct from uGUI's `UnityEngine.UI.Button`. Don't confuse them.
- `root.Q<T>("name")` returns null if the element isn't found — handle gracefully or assert during dev.
- For world-space UI (3D nameplates), uGUI's Canvas remains the right tool. UI Toolkit is screen-space-first.
- Unsubscribe (`clicked -= ...`) in `OnDisable` to avoid leaks on scene reload.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: ui-toolkit-over-ugui

After applying this guide, the agent's `Assets/Scripts/MainMenu.cs` should:

1. Import `UnityEngine.UIElements` (UI Toolkit namespace).
2. NOT import `UnityEngine.UI` (uGUI namespace).
3. Reference `UIDocument` and use `rootVisualElement.Q<Button>(...)` for element lookup.
4. NOT use `GetComponent<Button>()` for uGUI buttons.
5. Subscribe and unsubscribe button click handlers in OnEnable/OnDisable.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

`Assets/Scripts/MainMenu.cs` uses uGUI (`UnityEngine.UI`, `Canvas`, `Button.onClick`). Migrate it to UI Toolkit:
- Replace `UnityEngine.UI` import with `UnityEngine.UIElements`.
- Replace `Button` (uGUI type) lookups with `UIDocument.rootVisualElement.Q<Button>("name")`.
- Use `button.clicked += handler` (and unsubscribe in OnDisable).
```

- [ ] **Step 4: `demo/MainMenu.cs`**

```csharp
using UnityEngine;
using UnityEngine.UIElements;

public class MainMenu : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument;
    private Button playButton;
    private Button settingsButton;

    void OnEnable()
    {
        var root = uiDocument.rootVisualElement;
        playButton = root.Q<Button>("play-button");
        settingsButton = root.Q<Button>("settings-button");
        playButton.clicked += OnPlayClicked;
        settingsButton.clicked += OnSettingsClicked;
    }

    void OnDisable()
    {
        if (playButton != null) playButton.clicked -= OnPlayClicked;
        if (settingsButton != null) settingsButton.clicked -= OnSettingsClicked;
    }

    private void OnPlayClicked() { }
    private void OnSettingsClicked() { }
}
```

- [ ] **Step 5: `negative-demo/MainMenu.cs`**

```csharp
using UnityEngine;
using UnityEngine.UI;  // uGUI legacy import

public class MainMenu : MonoBehaviour
{
    [SerializeField] private Button playButton;       // uGUI Button via GetComponent or [SerializeField]
    [SerializeField] private Button settingsButton;

    void Start()
    {
        playButton.onClick.AddListener(OnPlayClicked);
        settingsButton.onClick.AddListener(OnSettingsClicked);
    }

    private void OnPlayClicked() { }
    private void OnSettingsClicked() { }
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'MainMenu.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('imports UnityEngine.UIElements (UI Toolkit)', () => {
  assert.ok(usesNamespace(codeOnly, 'UnityEngine.UIElements'));
});

test('does NOT import UnityEngine.UI (uGUI)', () => {
  assert.ok(!usesNamespace(codeOnly, 'UnityEngine.UI'));
});

test('references UIDocument', () => {
  assert.ok(hasPattern(codeOnly, /\bUIDocument\b/));
});

test('uses rootVisualElement.Q<...>() for element lookup', () => {
  assert.ok(hasPattern(codeOnly, /\.rootVisualElement\b/));
  assert.ok(hasPattern(codeOnly, /\.Q<\w+>\s*\(/));
});

test('does NOT use uGUI .onClick.AddListener pattern', () => {
  assert.ok(hasNoPattern(codeOnly, /\.onClick\.AddListener\s*\(/));
});

test('subscribes via .clicked += and unsubscribes via .clicked -=', () => {
  assert.ok(hasPattern(codeOnly, /\.clicked\s*\+=/));
  assert.ok(hasPattern(codeOnly, /\.clicked\s*-=/));
});
```

- [ ] **Step 7: Calibrate + commit**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-engine/ui-toolkit-over-ugui/grader.ts 2>&1 | tail -3
TARGET_FILE=$(pwd)/guides/unity-engine/ui-toolkit-over-ugui/negative-demo/MainMenu.cs \
  node --experimental-strip-types --test guides/unity-engine/ui-toolkit-over-ugui/grader.ts 2>&1 | tail -3
git add guides/unity-engine/ui-toolkit-over-ugui/
git commit -m "feat(guides): add ui-toolkit-over-ugui guide + grader"
```
Expected: demo 6/6; negative-demo fails ≥4.

---

## Task 3: `unity-engine/netcode-for-gameobjects-basics`

**Files:** `guides/unity-engine/netcode-for-gameobjects-basics/{guide.md, expectations.md, tasks/task.md, demo/PlayerNetwork.cs, negative-demo/PlayerNetwork.cs, grader.ts}`

- [ ] **Step 1: `guide.md`**

```markdown
---
id: netcode-for-gameobjects-basics
category: unity-engine
title: Netcode for GameObjects basics (Unity 6 multiplayer)
description: Use Unity's official Netcode for GameObjects package (NGO) for multiplayer: NetworkBehaviour + NetworkVariable + ServerRpc/ClientRpc. Don't write custom socket code.
useCases:
  - "Unity 6 multiplayer with Netcode for GameObjects"
  - "NetworkBehaviour vs MonoBehaviour"
  - "NetworkVariable for synced state"
  - "ServerRpc and ClientRpc"
  - "replace custom socket code in Unity"
relatedGuides: []
appliesTo:
  - "any Unity 6 multiplayer feature where authoritative server + client prediction matters"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# Netcode for GameObjects basics

For Unity 6 multiplayer, the supported path is the **Netcode for GameObjects** (NGO) package: `Unity.Netcode`. It provides authoritative-server networking with built-in client prediction hooks.

Three core primitives:
- **`NetworkBehaviour`**: drop-in replacement for `MonoBehaviour` on networked GameObjects.
- **`NetworkVariable<T>`**: a value automatically synced from server to clients.
- **`ServerRpc` / `ClientRpc`**: methods marked with these attributes are RPC calls — `ServerRpc` runs on the server when called from a client; `ClientRpc` is the reverse.

## Implementation

```csharp
using UnityEngine;
using Unity.Netcode;

public class PlayerNetwork : NetworkBehaviour
{
    private NetworkVariable<int> healthVar = new NetworkVariable<int>(
        100,
        NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server);

    public int Health => healthVar.Value;

    [ServerRpc]
    public void TakeDamageServerRpc(int amount)
    {
        if (!IsServer) return;
        healthVar.Value = Mathf.Max(0, healthVar.Value - amount);
        if (healthVar.Value == 0) OnDeathClientRpc();
    }

    [ClientRpc]
    private void OnDeathClientRpc()
    {
        // play death VFX on every client
    }
}
```

## Avoid

- Custom `System.Net.Sockets` socket code in gameplay — NGO handles serialization, ordering, and reliability for you.
- `MonoBehaviour` for networked entities — use `NetworkBehaviour` so spawn/despawn is managed.
- Plain fields for synced state — use `NetworkVariable<T>` so client/server stay in sync.
- Public methods that the client calls expecting server execution — mark with `[ServerRpc]` and rename `XxxServerRpc()`.

## Gotchas

- `NetworkVariable` field MUST be initialized at declaration; can't be assigned in Start.
- RPC methods MUST end with `ServerRpc` or `ClientRpc` suffix — NGO uses naming to wire dispatching.
- `IsServer` / `IsClient` / `IsOwner` are inherited from `NetworkBehaviour` — use them to gate logic.
- `NetworkVariable<T>` requires `T` to be either an unmanaged type (int, float, Vector3) or `INetworkSerializable`. Strings are special-cased via `FixedString*` types.
```

- [ ] **Step 2: `expectations.md`**

```markdown
# Expectations: netcode-for-gameobjects-basics

After applying this guide, the agent's `Assets/Scripts/PlayerNetwork.cs` should:

1. Import `Unity.Netcode`.
2. Extend `NetworkBehaviour` (NOT `MonoBehaviour`) for networked entities.
3. Use `NetworkVariable<T>` for state that should be server-authoritative and synced to clients.
4. Have at least one `[ServerRpc]` method whose name ends with `ServerRpc`.
5. Have at least one `[ClientRpc]` method whose name ends with `ClientRpc`.
6. NOT import `System.Net.Sockets` or write custom socket code.
```

- [ ] **Step 3: `tasks/task.md`**

```markdown
# Task

`Assets/Scripts/PlayerNetwork.cs` currently uses raw `System.Net.Sockets` for damage propagation. Refactor it to use Netcode for GameObjects:
- Replace `MonoBehaviour` with `NetworkBehaviour`.
- Replace the plain `int health` field with a `NetworkVariable<int> healthVar`.
- Replace the socket send with a `[ServerRpc]` `TakeDamageServerRpc(int amount)`.
- Add a `[ClientRpc]` `OnDeathClientRpc()` to broadcast death VFX to all clients.
```

- [ ] **Step 4: `demo/PlayerNetwork.cs`**

```csharp
using UnityEngine;
using Unity.Netcode;

public class PlayerNetwork : NetworkBehaviour
{
    private NetworkVariable<int> healthVar = new NetworkVariable<int>(
        100,
        NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server);

    public int Health => healthVar.Value;

    [ServerRpc]
    public void TakeDamageServerRpc(int amount)
    {
        if (!IsServer) return;
        healthVar.Value = Mathf.Max(0, healthVar.Value - amount);
        if (healthVar.Value == 0) OnDeathClientRpc();
    }

    [ClientRpc]
    private void OnDeathClientRpc()
    {
        // play death VFX on every client
    }
}
```

- [ ] **Step 5: `negative-demo/PlayerNetwork.cs`**

```csharp
using UnityEngine;
using System.Net.Sockets;
using System.Text;

public class PlayerNetwork : MonoBehaviour
{
    [SerializeField] private string serverHost = "127.0.0.1";
    [SerializeField] private int serverPort = 9000;
    private int health = 100;

    public void TakeDamage(int amount)
    {
        health = Mathf.Max(0, health - amount);
        using var client = new TcpClient(serverHost, serverPort);
        using var stream = client.GetStream();
        var bytes = Encoding.UTF8.GetBytes($"damage:{amount}");
        stream.Write(bytes, 0, bytes.Length);
    }
}
```

- [ ] **Step 6: `grader.ts`**

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { readCSharp, hasPattern, hasNoPattern, usesNamespace, declaresType } from '../../test-fixture.ts';

const TARGET = process.env.TARGET_FILE
  ?? path.join(import.meta.dirname, 'demo', 'PlayerNetwork.cs');
const src = readCSharp(TARGET);
const codeOnly = src.replace(/\/\/[^\n]*/g, '');

test('imports Unity.Netcode', () => {
  assert.ok(usesNamespace(codeOnly, 'Unity.Netcode'));
});

test('extends NetworkBehaviour (not MonoBehaviour)', () => {
  assert.ok(hasPattern(codeOnly, /\bPlayerNetwork\s*:\s*NetworkBehaviour\b/));
  assert.ok(hasNoPattern(codeOnly, /\bPlayerNetwork\s*:\s*MonoBehaviour\b/));
});

test('uses NetworkVariable<T> for synced state', () => {
  assert.ok(hasPattern(codeOnly, /\bNetworkVariable<\w+>/));
});

test('has at least one [ServerRpc] method ending with ServerRpc', () => {
  assert.ok(hasPattern(codeOnly, /\[ServerRpc\]/));
  assert.ok(hasPattern(codeOnly, /\bvoid\s+\w+ServerRpc\s*\(/));
});

test('has at least one [ClientRpc] method ending with ClientRpc', () => {
  assert.ok(hasPattern(codeOnly, /\[ClientRpc\]/));
  assert.ok(hasPattern(codeOnly, /\bvoid\s+\w+ClientRpc\s*\(/));
});

test('does NOT import System.Net.Sockets', () => {
  assert.ok(!usesNamespace(codeOnly, 'System.Net.Sockets'));
});
```

- [ ] **Step 7: Calibrate + commit**

```bash
cd /Users/lijinglue/repo/ggdd
node --experimental-strip-types --test guides/unity-engine/netcode-for-gameobjects-basics/grader.ts 2>&1 | tail -3
TARGET_FILE=$(pwd)/guides/unity-engine/netcode-for-gameobjects-basics/negative-demo/PlayerNetwork.cs \
  node --experimental-strip-types --test guides/unity-engine/netcode-for-gameobjects-basics/grader.ts 2>&1 | tail -3
git add guides/unity-engine/netcode-for-gameobjects-basics/
git commit -m "feat(guides): add netcode-for-gameobjects-basics guide + grader"
```
Expected: demo 6/6; negative-demo fails ≥5.

---

## Task 4: Refresh corpus + CONTEXT.md + tag

```bash
cd /Users/lijinglue/repo/ggdd/serving
node --experimental-strip-types scripts/build-guides.ts
node --experimental-strip-types skills-cli/build-dist.ts
cd ..
node --experimental-strip-types bin/ggdd-dev.ts dev-all --test-grader 2>&1 | tail -3
```
Expected: `All 51 graders calibrated.`

Update `CONTEXT.md` — replace the guides/ entry:

```
- `guides/` — guide content. 51 guides across 16 categories. v2 content seed is complete (Plans 7a-d). Plan 8+ can either deepen existing categories (3rd guide per category) or expand into new genres (puzzle, survival, citybuilder, rhythm, racing, horror, etc.).
```

```bash
git add serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin CONTEXT.md
git commit -m "feat(serving): regenerate corpus from 51 guides (Plan 7d adds 3 Unity engine guides)"
git tag v1.4.0-plan7d
```

---

## Plan 7d acceptance

- [ ] `find guides -name guide.md | wc -l` → `51`
- [ ] `ggdd-dev dev-all --test-grader` → `All 51 graders calibrated.`
- [ ] Tag `v1.4.0-plan7d`

---

## v2 complete after Plan 7d

After Plan 7d ships:
- 51 guides across 16 categories
- All Tier-1 design genres covered (shooter ×4, platformer ×3, soulslike, AI perception, RTS-classic, MOBA, MMORTS)
- Unity engine: 6 guides (3 original v1 + Cinemachine 3 + UI Toolkit + Netcode)

The next plan (8+) could deepen coverage (3rd guides per category that currently have 2 or 3) or expand into new genres per the original Tier 2/3 list (survival, citybuilder, tower-defense, puzzle, stealth-action, rhythm, racing, horror, coop, pvp).
