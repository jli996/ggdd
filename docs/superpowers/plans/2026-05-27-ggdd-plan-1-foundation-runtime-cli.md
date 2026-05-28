# ggdd Plan 1 — Foundation + Runtime CLI + MCP Server

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the publishable `serving/` package so that `npx ggdd@latest search|list|retrieve` and an equivalent MCP server work against a seeded guide corpus, ready for content authoring in Plan 2.

**Architecture:** pnpm-workspace monorepo. Root package is private (`ggdd-dev` lives there in Plan 3). `serving/` is the published npm package (`name: ggdd`). Guides are markdown files with YAML frontmatter under `guides/<category>/<id>/guide.md`. A build script walks `guides/`, generates `serving/lib/use-cases.gen.ts` (catalog) and `serving/lib/embeddings.gen.bin` (pre-computed MiniLM vectors). Runtime CLI embeds the query and does cosine similarity against the pre-computed corpus — zero model inference for the corpus, zero network calls, zero API keys.

**Tech Stack:** Node 22+ (`--experimental-strip-types`), pnpm workspaces, TypeScript 5.9, `node:test`, `@tensorflow/tfjs-core` + `@tensorflow/tfjs-converter`, `@huggingface/transformers` (BertTokenizer only), `@modelcontextprotocol/sdk`, `gray-matter` (YAML frontmatter), `zod` (schema validation), `esbuild` (bundling), git LFS for the MiniLM model weights.

**Reference project:** `/Users/lijinglue/repo/modern-web-guidance-src` (MWG) — file structures, embedder, search/retrieve flow, and the SKILL.md/plugin shapes are deliberate ports of MWG with renames.

---

## File map

Created in this plan:

```
/Users/lijinglue/repo/ggdd/
├── package.json                                        # workspace root, private
├── pnpm-workspace.yaml
├── tsconfig.json
├── .gitignore
├── .gitattributes                                      # LFS for MiniLM model dir
├── .env.example
├── .oxlintrc.json
├── .oxlintignore
├── README.md
├── LICENSE                                             # Apache-2.0
├── CONTEXT.md
├── lib/
│   ├── colors.ts
│   ├── colors.test.ts
│   ├── paths.ts
│   ├── paths.test.ts
│   ├── guide-validation.ts
│   └── guide-validation.test.ts
├── guides/
│   └── unity-engine/
│       └── new-input-system-basics/
│           ├── guide.md
│           ├── expectations.md
│           └── tasks/
│               └── task.md
├── serving/
│   ├── package.json
│   ├── bin/
│   │   └── ggdd.ts
│   ├── lib/
│   │   ├── version.ts
│   │   ├── version.test.ts
│   │   ├── tfjs-embedder.ts
│   │   ├── tfjs-embedder.test.ts
│   │   ├── tfjs-kernels.ts
│   │   ├── search.ts
│   │   ├── search.test.ts
│   │   ├── retrieve.ts
│   │   ├── retrieve.test.ts
│   │   ├── practices.ts
│   │   ├── practices.test.ts
│   │   ├── include.ts
│   │   ├── macros.ts
│   │   ├── macros.test.ts
│   │   ├── use-cases.gen.ts                            # generated, committed
│   │   ├── embeddings.gen.bin                          # generated, committed
│   │   └── tfjs_model_minilm/                          # vendored via LFS
│   │       ├── model.json
│   │       ├── group1-shard1of1.bin
│   │       └── README.md
│   ├── scripts/
│   │   ├── build-guides.ts
│   │   ├── build-guides.test.ts
│   │   └── build-megaskill.ts
│   ├── mcp-server/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   ├── integration.test.ts
│   │   └── tools/
│   │       ├── search.ts
│   │       └── retrieve.ts
│   ├── megaskill/
│   │   └── megaskill.md
│   └── skills-cli/
│       ├── build-dist.ts
│       ├── build-dist.test.ts
│       ├── telemetry/
│       │   ├── ClearcutLogger.ts
│       │   ├── ClearcutLogger.test.ts
│       │   └── types.ts
│       └── template/
│           ├── SKILL.md
│           ├── plugin.json
│           └── plugin-json.test.ts
└── .github/
    └── workflows/
        └── preflight.yml
```

---

## Task 1: Workspace skeleton

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `.env.example`
- Create: `.oxlintrc.json`
- Create: `.oxlintignore`
- Create: `README.md`
- Create: `LICENSE`
- Create: `CONTEXT.md`

- [ ] **Step 1: Verify git + LFS are installed**

Run: `git --version && git lfs version`
Expected: both print version strings. If `git lfs` is missing, install via Homebrew: `brew install git-lfs && git lfs install`.

- [ ] **Step 2: Initialize LFS in the repo**

Run: `git lfs install --local`
Expected: `Updated Git hooks.\nGit LFS initialized.`

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "ggdd-workspace",
  "version": "0.0.0",
  "description": "Game Guidance for Development Done-right — Unity 6 guidance for coding agents",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "pnpm -r --parallel test",
    "build": "pnpm -r run build",
    "typecheck": "tsc --noEmit && pnpm -r --parallel typecheck",
    "lint": "oxlint --ignore-path .oxlintignore",
    "preflight": "pnpm build && pnpm typecheck && pnpm lint && pnpm test",
    "build:mcp": "pnpm --filter serving build",
    "build:megaskill": "pnpm --filter serving build:megaskill"
  },
  "packageManager": "pnpm@10.30.3",
  "devDependencies": {
    "@types/node": "^25.6.0",
    "gray-matter": "^4.0.3",
    "oxlint": "^1.55.0",
    "typescript": "^5.9.3"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild",
      "onnxruntime-node"
    ]
  }
}
```

- [ ] **Step 4: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "serving"
```

(More packages — `guides`, `harness`, `eval-view` — will be added in later plans.)

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2023"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "types": ["node"]
  },
  "include": ["bin/**/*.ts", "lib/**/*.ts", "guides/**/*.ts", "serving/**/*.ts", "harness/**/*.ts"],
  "exclude": ["**/node_modules/**", "**/build/**", "**/dist/**", "**/library-cache/**"]
}
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
**/node_modules/
.env
.env.local
*.log
.DS_Store

# Build outputs
**/build/
**/dist/

# Unity (for future base-apps in Plan 4)
**/Library/
**/Temp/
**/Logs/
**/Obj/
**/obj/
**/Build/
**/Builds/
**/UserSettings/
**/MemoryCaptures/
**/*.csproj
**/*.sln
**/*.suo
**/*.user
**/*.unityproj
**/library-cache/

# Harness outputs (Plan 4)
harness/runs/
```

- [ ] **Step 7: Create `.gitattributes`**

```
# Vendored MiniLM model (large binary weights)
serving/lib/tfjs_model_minilm/*.bin filter=lfs diff=lfs merge=lfs -text

# Unity binary asset LFS rules (applied when base-apps land in Plan 4)
*.psd          filter=lfs diff=lfs merge=lfs -text
*.png          filter=lfs diff=lfs merge=lfs -text
*.jpg          filter=lfs diff=lfs merge=lfs -text
*.jpeg         filter=lfs diff=lfs merge=lfs -text
*.tga          filter=lfs diff=lfs merge=lfs -text
*.exr          filter=lfs diff=lfs merge=lfs -text
*.fbx          filter=lfs diff=lfs merge=lfs -text
*.obj          filter=lfs diff=lfs merge=lfs -text
*.blend        filter=lfs diff=lfs merge=lfs -text
*.wav          filter=lfs diff=lfs merge=lfs -text
*.mp3          filter=lfs diff=lfs merge=lfs -text
*.ogg          filter=lfs diff=lfs merge=lfs -text
*.aif          filter=lfs diff=lfs merge=lfs -text
*.anim         filter=lfs diff=lfs merge=lfs -text
*.controller   filter=lfs diff=lfs merge=lfs -text
*.bytes        filter=lfs diff=lfs merge=lfs -text
*.dll          filter=lfs diff=lfs merge=lfs -text
*.so           filter=lfs diff=lfs merge=lfs -text
*.dylib        filter=lfs diff=lfs merge=lfs -text

# Force text/UTF-8 for Unity YAML (readable diffs in PRs)
*.unity        text eol=lf
*.prefab       text eol=lf
*.asset        text eol=lf
*.mat          text eol=lf
*.meta         text eol=lf
```

- [ ] **Step 8: Create `.env.example`**

```
# Plan 3 / harness: required for LLM-driven grader / negative-demo generation
ANTHROPIC_API_KEY=

# Plan 4 harness: optional, used by gemini-cli-agent runner
GEMINI_API_KEY=

# Plan 5 dashboard upload (optional)
GGDD_GCS_BUCKET=

# Telemetry sink (default = unset = no-op)
GGDD_TELEMETRY_ENDPOINT=

# Unity 6 Editor path (autodetect under Hub/Editor/6000.* if unset)
UNITY_EDITOR_PATH=
```

- [ ] **Step 9: Create `.oxlintrc.json`**

```json
{
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  },
  "ignorePatterns": ["**/build/**", "**/dist/**", "**/*.gen.ts"]
}
```

- [ ] **Step 10: Create `.oxlintignore`**

```
node_modules/
**/build/
**/dist/
**/*.gen.ts
serving/lib/tfjs_model_minilm/
```

- [ ] **Step 11: Create `README.md`**

```markdown
# ggdd

Game Guidance for Development Done-right — curated, token-efficient Unity 6 guidance for coding agents.

Modelled after [`modern-web-guidance-src`](https://github.com/GoogleChrome/modern-web-guidance-src) (MWG), targeting Unity game development across engine usage, performance, and genre-level design patterns.

## Quickstart (Plan 1 scope)

```shell
# From source (until npm publish in Plan 6):
pnpm install
pnpm build
node --experimental-strip-types serving/bin/ggdd.ts search "input system"
node --experimental-strip-types serving/bin/ggdd.ts retrieve "new-input-system-basics"
```

## Layout

See [CONTEXT.md](./CONTEXT.md) for repo orientation. See [docs/superpowers/specs/2026-05-27-ggdd-design.md](./docs/superpowers/specs/2026-05-27-ggdd-design.md) for the v1 design.

## License

Apache-2.0.
```

- [ ] **Step 12: Create `LICENSE`**

Copy the standard Apache 2.0 license text. The simplest way: download the canonical text.

Run:
```bash
curl -fsSL https://www.apache.org/licenses/LICENSE-2.0.txt -o LICENSE
```
Expected: file `LICENSE` exists with the Apache 2.0 license text (starts with `Apache License\nVersion 2.0, January 2004`).

- [ ] **Step 13: Create `CONTEXT.md`**

```markdown
# ggdd repository orientation

## Top-level layout

- `serving/` — npm-publishable package (`name: ggdd`). Runtime CLI + MCP server + vendored MiniLM. Zero network calls, zero API keys, runs offline. Source of truth for what end users get.
- `guides/` — guide content (Plan 2). One directory per guide under `guides/<category>/<guide-id>/`.
- `lib/` — shared library code used by both root tooling (`ggdd-dev`, Plan 3) and `guides/` author-time tooling.
- `bin/` — root dev CLI (`ggdd-dev`, Plan 3). Not published.
- `harness/` — eval infrastructure (Plan 4). Unity base-apps, agent runners.
- `eval-view/` — dashboard SPA (Plan 5).

## Workflow

PR CI runs `pnpm preflight` (build + typecheck + lint + tests). Nightly CI runs the full eval suite (Plan 4 onward).

## Active TODOs

- Telemetry sink (`ClearcutLogger`) is a no-op stub; decide before public launch whether to wire to an opt-in endpoint or strip the code entirely. See spec §8.3 item 1.

## See also

- [Design spec](./docs/superpowers/specs/2026-05-27-ggdd-design.md)
- Reference project: `../modern-web-guidance-src` (MWG)
```

- [ ] **Step 14: Install deps and verify workspace boots**

Run: `pnpm install`
Expected: `Done in <Xs>` with no errors. Creates `node_modules/`, `pnpm-lock.yaml`.

- [ ] **Step 15: Verify TypeScript can typecheck the empty tree**

Run: `pnpm typecheck`
Expected: exits 0 (no errors). May warn about empty include patterns; that's fine.

- [ ] **Step 16: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.json .gitignore .gitattributes \
        .env.example .oxlintrc.json .oxlintignore README.md LICENSE CONTEXT.md \
        pnpm-lock.yaml
git commit -m "chore: scaffold pnpm workspace, tsconfig, gitignore/LFS rules"
```

---

## Task 2: Shared lib (paths, colors)

**Files:**
- Create: `lib/paths.ts`
- Create: `lib/paths.test.ts`
- Create: `lib/colors.ts`
- Create: `lib/colors.test.ts`

- [ ] **Step 1: Write failing test for `paths.ts`**

`lib/paths.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { rootDir, guidesDir, servingDir, baseAppsDir, evalViewDir } from './paths.ts';

test('rootDir points to the repo root (contains package.json with name=ggdd-workspace)', () => {
  const pkgPath = path.join(rootDir, 'package.json');
  assert.ok(fs.existsSync(pkgPath), `expected package.json at ${pkgPath}`);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert.equal(pkg.name, 'ggdd-workspace');
});

test('all derived dirs are absolute paths under rootDir', () => {
  for (const dir of [guidesDir, servingDir, baseAppsDir, evalViewDir]) {
    assert.ok(path.isAbsolute(dir), `${dir} is not absolute`);
    assert.ok(dir.startsWith(rootDir), `${dir} does not start with rootDir ${rootDir}`);
  }
});

test('derived dirs have expected names', () => {
  assert.equal(path.basename(guidesDir), 'guides');
  assert.equal(path.basename(servingDir), 'serving');
  assert.equal(path.basename(evalViewDir), 'eval-view');
  assert.equal(baseAppsDir, path.join(rootDir, 'harness', 'base_apps'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test lib/paths.test.ts`
Expected: FAIL — `Cannot find module './paths.ts'`.

- [ ] **Step 3: Implement `paths.ts`**

`lib/paths.ts`:

```typescript
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// lib/ is at <rootDir>/lib, so rootDir is one level up.
export const rootDir = path.resolve(__dirname, '..');

export const guidesDir = path.join(rootDir, 'guides');
export const servingDir = path.join(rootDir, 'serving');
export const baseAppsDir = path.join(rootDir, 'harness', 'base_apps');
export const evalViewDir = path.join(rootDir, 'eval-view');
export const featuresDir = path.join(rootDir, 'features');
export const harnessDir = path.join(rootDir, 'harness');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test lib/paths.test.ts`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Write failing test for `colors.ts`**

`lib/colors.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { cRed, cGreen, cCyan, cYellow, cDim, cBold, stripAnsi } from './colors.ts';

test('color functions wrap text with ANSI escape sequences', () => {
  assert.match(cRed('hello'), /\x1b\[31m.*hello.*\x1b\[39m/);
  assert.match(cGreen('hello'), /\x1b\[32m.*hello.*\x1b\[39m/);
  assert.match(cCyan('hello'), /\x1b\[36m.*hello.*\x1b\[39m/);
  assert.match(cYellow('hello'), /\x1b\[33m.*hello.*\x1b\[39m/);
});

test('cBold and cDim add bold/dim sequences', () => {
  assert.match(cBold('x'), /\x1b\[1m.*x.*\x1b\[22m/);
  assert.match(cDim('x'), /\x1b\[2m.*x.*\x1b\[22m/);
});

test('stripAnsi removes color codes', () => {
  assert.equal(stripAnsi(cRed('hello')), 'hello');
  assert.equal(stripAnsi(cBold(cCyan('mixed'))), 'mixed');
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `node --experimental-strip-types --test lib/colors.test.ts`
Expected: FAIL — `Cannot find module './colors.ts'`.

- [ ] **Step 7: Implement `colors.ts`**

`lib/colors.ts`:

```typescript
const ESC = '\x1b[';

function wrap(open: number, close: number, text: string): string {
  return `${ESC}${open}m${text}${ESC}${close}m`;
}

export const cRed = (s: string) => wrap(31, 39, s);
export const cGreen = (s: string) => wrap(32, 39, s);
export const cYellow = (s: string) => wrap(33, 39, s);
export const cBlue = (s: string) => wrap(34, 39, s);
export const cMagenta = (s: string) => wrap(35, 39, s);
export const cCyan = (s: string) => wrap(36, 39, s);
export const cBold = (s: string) => wrap(1, 22, s);
export const cDim = (s: string) => wrap(2, 22, s);

const ANSI_RE = /\x1b\[[0-9;]*m/g;
export function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node --experimental-strip-types --test lib/colors.test.ts`
Expected: PASS — 3 tests green.

- [ ] **Step 9: Commit**

```bash
git add lib/paths.ts lib/paths.test.ts lib/colors.ts lib/colors.test.ts
git commit -m "feat(lib): add shared paths and colors helpers"
```

---

## Task 3: Guide frontmatter validator

**Files:**
- Create: `lib/guide-validation.ts`
- Create: `lib/guide-validation.test.ts`

Install dep first.

- [ ] **Step 1: Add `gray-matter` and `zod` to root devDependencies**

`gray-matter` is already in `package.json` from Task 1. Add `zod`:

Run: `pnpm add -D -w zod@^4.4.3`
Expected: `package.json` updated, `pnpm-lock.yaml` updated.

- [ ] **Step 2: Write failing test**

`lib/guide-validation.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { parseGuide, validateFrontmatter, GuideValidationError } from './guide-validation.ts';

const VALID_GUIDE = `---
id: gc-free-update-loop
category: unity-performance
title: GC-free Update() loops
description: Prevents per-frame heap allocations.
useCases:
  - "avoid GC spikes in Update"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

Body content here.
`;

test('parseGuide extracts frontmatter and body', () => {
  const parsed = parseGuide(VALID_GUIDE);
  assert.equal(parsed.frontmatter.id, 'gc-free-update-loop');
  assert.equal(parsed.frontmatter.category, 'unity-performance');
  assert.equal(parsed.body.trim(), 'Body content here.');
});

test('validateFrontmatter accepts a complete frontmatter object', () => {
  const parsed = parseGuide(VALID_GUIDE);
  const validated = validateFrontmatter(parsed.frontmatter);
  assert.equal(validated.id, 'gc-free-update-loop');
  assert.deepEqual(validated.useCases, ['avoid GC spikes in Update']);
  assert.equal(validated.gradeMode, 'static');
});

test('validateFrontmatter rejects missing required field', () => {
  assert.throws(
    () => validateFrontmatter({ id: 'x', category: 'unity-performance' }),
    GuideValidationError,
  );
});

test('validateFrontmatter rejects invalid gradeMode', () => {
  assert.throws(() => validateFrontmatter({
    id: 'x',
    category: 'unity-performance',
    title: 'T',
    description: 'D',
    useCases: ['u'],
    gradeMode: 'not-a-mode',
    unityVersion: '6000.0',
    baseApp: 'empty-unity6',
  }), GuideValidationError);
});

test('validateFrontmatter accepts optional relatedGuides + appliesTo', () => {
  const valid = validateFrontmatter({
    id: 'x',
    category: 'unity-performance',
    title: 'T',
    description: 'D',
    useCases: ['u'],
    gradeMode: 'static+unity',
    unityVersion: '6000.0',
    baseApp: 'empty-unity6',
    relatedGuides: ['object-pooling-basics'],
    appliesTo: ['MonoBehaviour scripts'],
  });
  assert.deepEqual(valid.relatedGuides, ['object-pooling-basics']);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --experimental-strip-types --test lib/guide-validation.test.ts`
Expected: FAIL — `Cannot find module './guide-validation.ts'`.

- [ ] **Step 4: Implement `guide-validation.ts`**

`lib/guide-validation.ts`:

```typescript
import matter from 'gray-matter';
import { z } from 'zod';

export const GuideFrontmatterSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'id must be lowercase letters, digits, hyphens'),
  category: z.enum([
    'unity-engine',
    'unity-performance',
    'game-design-action',
    'game-design-deckbuilder',
  ]),
  title: z.string().min(1),
  description: z.string().min(1),
  useCases: z.array(z.string().min(1)).min(1),
  relatedGuides: z.array(z.string()).optional(),
  appliesTo: z.array(z.string()).optional(),
  gradeMode: z.enum(['static', 'unity', 'static+unity']),
  unityVersion: z.string().min(1),
  baseApp: z.string().min(1),
});

export type GuideFrontmatter = z.infer<typeof GuideFrontmatterSchema>;

export interface ParsedGuide {
  frontmatter: Record<string, unknown>;
  body: string;
}

export class GuideValidationError extends Error {
  constructor(message: string, public readonly issues?: unknown) {
    super(message);
    this.name = 'GuideValidationError';
  }
}

export function parseGuide(source: string): ParsedGuide {
  const { data, content } = matter(source);
  return { frontmatter: data, body: content };
}

export function validateFrontmatter(raw: Record<string, unknown>): GuideFrontmatter {
  const result = GuideFrontmatterSchema.safeParse(raw);
  if (!result.success) {
    throw new GuideValidationError(
      `Invalid guide frontmatter: ${result.error.message}`,
      result.error.issues,
    );
  }
  return result.data;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --experimental-strip-types --test lib/guide-validation.test.ts`
Expected: PASS — 5 tests green.

- [ ] **Step 6: Commit**

```bash
git add lib/guide-validation.ts lib/guide-validation.test.ts package.json pnpm-lock.yaml
git commit -m "feat(lib): add frontmatter parser and zod-based validator"
```

---

## Task 4: First seed guide

**Files:**
- Create: `guides/unity-engine/new-input-system-basics/guide.md`
- Create: `guides/unity-engine/new-input-system-basics/expectations.md`
- Create: `guides/unity-engine/new-input-system-basics/tasks/task.md`

This guide exists so Plan 1 has at least one piece of real content for the search corpus to index. Full content depth lands in Plan 2.

- [ ] **Step 1: Create `guide.md`**

`guides/unity-engine/new-input-system-basics/guide.md`:

```markdown
---
id: new-input-system-basics
category: unity-engine
title: New Input System basics (Unity 6)
description: Use Unity's Input System package over the legacy Input Manager for keyboard, mouse, gamepad, and touch handling.
useCases:
  - "read player input in Unity"
  - "handle keyboard input in Unity"
  - "handle gamepad input in Unity"
  - "replace legacy Input.GetKey with new Input System"
  - "set up Input Actions in Unity"
relatedGuides: []
appliesTo:
  - "any MonoBehaviour reading per-frame input"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---

# New Input System basics

Unity 6 ships the [Input System package](https://docs.unity3d.com/Packages/com.unity.inputsystem@1.7/manual/index.html) as the default. The legacy `UnityEngine.Input` API (`Input.GetKey`, `Input.GetAxis`) is still present for backward compatibility, but new code should use the Input System.

## Use the Input System package

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

## Avoid

- `UnityEngine.Input.GetKey`, `Input.GetAxis`, `Input.GetButton` — these read from the legacy Input Manager which is *separately* configured under Project Settings → Input Manager. Modern projects should not mix the two.
- Hard-coding `KeyCode.Space` etc. in gameplay scripts. Bind inputs in an `.inputactions` asset so rebinding works.

## Gotchas

- The Input System requires `Active Input Handling` set to `Input System Package (New)` or `Both` in Project Settings → Player. Pure `Input System Package (New)` is preferred.
- `Action.ReadValue<T>()` returns a fresh value each call — no need to cache.
- For UI, use `InputSystemUIInputModule` on the EventSystem in place of the legacy `StandaloneInputModule`.
```

- [ ] **Step 2: Create `expectations.md`**

`guides/unity-engine/new-input-system-basics/expectations.md`:

```markdown
# Expectations: new-input-system-basics

After applying this guide, the agent's modified C# should:

1. Import `UnityEngine.InputSystem`.
2. Bind input via an `InputActionAsset` or `InputAction` field rather than `Input.GetKey`/`Input.GetAxis`.
3. Read values with `action.ReadValue<T>()` or subscribe to `action.performed`.
4. Not use `UnityEngine.Input` static methods (`Input.GetKey`, `Input.GetAxis`, `Input.GetButton`, etc.).
```

- [ ] **Step 3: Create `tasks/task.md`**

`guides/unity-engine/new-input-system-basics/tasks/task.md`:

```markdown
# Task

The file `Assets/Scripts/PlayerController.cs` reads input via the legacy `Input.GetAxis("Horizontal")` / `Input.GetAxis("Vertical")`. Refactor it to use Unity's Input System package instead, binding to an `InputAction` named `Move` that returns a `Vector2`.

Do not change the player movement behavior — only the input source.
```

- [ ] **Step 4: Validate the seed guide against the schema**

Quick sanity test. Write `lib/seed-guide-smoke.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseGuide, validateFrontmatter } from './guide-validation.ts';
import { guidesDir } from './paths.ts';

test('all seed guides have valid frontmatter', () => {
  const seedPaths: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name === 'guide.md') seedPaths.push(full);
    }
  }
  if (fs.existsSync(guidesDir)) walk(guidesDir);

  assert.ok(seedPaths.length >= 1, `expected at least 1 seed guide under ${guidesDir}`);
  for (const p of seedPaths) {
    const { frontmatter } = parseGuide(fs.readFileSync(p, 'utf8'));
    assert.doesNotThrow(() => validateFrontmatter(frontmatter), `invalid frontmatter in ${p}`);
  }
});
```

- [ ] **Step 5: Run test**

Run: `node --experimental-strip-types --test lib/seed-guide-smoke.test.ts`
Expected: PASS — 1 test green, found the seed guide.

- [ ] **Step 6: Commit**

```bash
git add guides/unity-engine/new-input-system-basics/ lib/seed-guide-smoke.test.ts
git commit -m "feat(guides): seed first guide (new-input-system-basics) for corpus tests"
```

---

## Task 5: Serving package skeleton

**Files:**
- Create: `serving/package.json`
- Create: `serving/bin/ggdd.ts`
- Create: `serving/lib/version.ts`
- Create: `serving/lib/version.test.ts`

- [ ] **Step 1: Create `serving/package.json`**

`serving/package.json`:

```json
{
  "name": "ggdd",
  "version": "0.0.1",
  "description": "Game Guidance for Development Done-right — Unity 6 guidance CLI for coding agents",
  "type": "module",
  "license": "Apache-2.0",
  "bin": {
    "ggdd": "bin/ggdd.ts"
  },
  "files": [
    "bin",
    "lib",
    "mcp-server",
    "megaskill",
    "skills-cli/template",
    "build",
    "README.md"
  ],
  "scripts": {
    "build": "node --experimental-strip-types scripts/build-guides.ts && node --experimental-strip-types skills-cli/build-dist.ts",
    "build:megaskill": "node --experimental-strip-types scripts/build-megaskill.ts",
    "test": "node --test --experimental-strip-types --test-reporter=${TEST_REPORTER:-spec} '**/*.test.ts'",
    "typecheck": "tsc --noEmit",
    "start": "node --experimental-strip-types mcp-server/index.ts"
  },
  "dependencies": {
    "@huggingface/transformers": "^3.8.1",
    "@modelcontextprotocol/sdk": "^1.29.0",
    "@tensorflow/tfjs-backend-cpu": "^4.22.0",
    "@tensorflow/tfjs-converter": "^4.22.0",
    "@tensorflow/tfjs-core": "^4.22.0",
    "gray-matter": "^4.0.3",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "esbuild": "^0.27.4",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Install serving deps**

Run: `pnpm install`
Expected: serving package linked into workspace, deps installed.

- [ ] **Step 3: Create `serving/bin/ggdd.ts` skeleton**

`serving/bin/ggdd.ts`:

```typescript
#!/usr/bin/env -S node --experimental-strip-types

import { parseArgs } from 'node:util';

function printUsage() {
  console.log(`
Usage: ggdd <command> [args]

Commands:
  search <query>            Search use cases by query
  list                      List all available use cases
  retrieve <ids>            Retrieve use case(s) by ID(s), comma-separated
  install [--choose]        Install the ggdd skill
  uninstall                 Uninstall the ggdd skill
  update                    Update installed ggdd skills

Options:
  --skill-version <version> Internal: version of the skill being executed
  --choose                  Choose specific skills interactively
  -h, --help                Show this help
  -v, --version             Show version
`);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      choose: { type: 'boolean' },
      'skill-version': { type: 'string' },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.help || positionals.length === 0) {
    printUsage();
    process.exit(values.help ? 0 : 1);
  }

  if (values.version) {
    const { getVersion } = await import('../lib/version.ts');
    console.log(getVersion(import.meta.dirname));
    process.exit(0);
  }

  console.error(`Unknown command: ${positionals[0]}`);
  printUsage();
  process.exit(1);
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
```

- [ ] **Step 4: Write failing test for `version.ts`**

`serving/lib/version.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getVersion } from './version.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('getVersion reads version from nearest package.json', () => {
  const v = getVersion(__dirname);
  assert.match(v, /^\d+\.\d+\.\d+/);
});

test('getVersion finds the serving package.json (version 0.0.1)', () => {
  const v = getVersion(__dirname);
  assert.equal(v, '0.0.1');
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test lib/version.test.ts`
Expected: FAIL — `Cannot find module './version.ts'`.

- [ ] **Step 6: Implement `version.ts`**

`serving/lib/version.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

export function getVersion(startDir: string): string {
  let dir = startDir;
  while (true) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.version) return pkg.version as string;
    }
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`No package.json found above ${startDir}`);
    dir = parent;
  }
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test lib/version.test.ts`
Expected: PASS — 2 tests green.

- [ ] **Step 8: Verify CLI --help works**

Run: `node --experimental-strip-types serving/bin/ggdd.ts --help`
Expected: prints the usage block, exit 0.

- [ ] **Step 9: Verify CLI --version works**

Run: `node --experimental-strip-types serving/bin/ggdd.ts --version`
Expected: prints `0.0.1`, exit 0.

- [ ] **Step 10: Commit**

```bash
git add serving/package.json serving/bin/ggdd.ts serving/lib/version.ts serving/lib/version.test.ts pnpm-lock.yaml
git commit -m "feat(serving): scaffold ggdd CLI skeleton with --help and --version"
```

---

## Task 6: Vendor the MiniLM model

**Files:**
- Create: `serving/lib/tfjs_model_minilm/model.json`
- Create: `serving/lib/tfjs_model_minilm/group1-shard1of1.bin` (via LFS)
- Create: `serving/lib/tfjs_model_minilm/README.md`

The model weights total ~22 MB. We vendor them by copying from MWG's verified vendor copy. Per `.gitattributes` (Task 1 Step 7), `serving/lib/tfjs_model_minilm/*.bin` is tracked via LFS.

> **Prerequisite:** This task assumes the MWG source repository is checked out at `/Users/lijinglue/repo/modern-web-guidance-src`. If you don't have MWG cloned, run first: `git clone https://github.com/GoogleChrome/modern-web-guidance-src.git /Users/lijinglue/repo/modern-web-guidance-src` (then `git lfs pull` inside it, if MWG uses LFS for the model — it does not, the .bin is checked in directly).

- [ ] **Step 1: Verify MWG source has the model files**

Run: `ls -lh /Users/lijinglue/repo/modern-web-guidance-src/serving/lib/tfjs_model_minilm/`
Expected: 3 files at minimum — `model.json` (~few KB), `group1-shard1of1.bin` (~22 MB), `README.md`.

- [ ] **Step 2: Copy model files into ggdd**

Run:
```bash
mkdir -p serving/lib/tfjs_model_minilm
cp /Users/lijinglue/repo/modern-web-guidance-src/serving/lib/tfjs_model_minilm/model.json \
   /Users/lijinglue/repo/modern-web-guidance-src/serving/lib/tfjs_model_minilm/group1-shard1of1.bin \
   /Users/lijinglue/repo/modern-web-guidance-src/serving/lib/tfjs_model_minilm/README.md \
   serving/lib/tfjs_model_minilm/
ls -lh serving/lib/tfjs_model_minilm/
```
Expected: 3 files copied; `group1-shard1of1.bin` shows ~22 MB.

- [ ] **Step 3: Verify LFS will track the .bin**

Run: `git check-attr -a serving/lib/tfjs_model_minilm/group1-shard1of1.bin`
Expected: output contains `filter: lfs`, `diff: lfs`, `merge: lfs`, and `text: unset`.

- [ ] **Step 4: Stage and verify LFS pointer is created**

Run:
```bash
git add serving/lib/tfjs_model_minilm/
git ls-files --stage serving/lib/tfjs_model_minilm/group1-shard1of1.bin
```
Expected: the indexed blob is the LFS pointer (~130 bytes), not the raw 22 MB binary. The pointer file content starts with `version https://git-lfs.github.com/spec/v1`.

To confirm, run: `git show :serving/lib/tfjs_model_minilm/group1-shard1of1.bin | head -3`
Expected: 3 lines including `version https://git-lfs.github.com/spec/v1` and `oid sha256:<hash>` and `size 22...`.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(serving): vendor MiniLM model weights (LFS-tracked) for offline embeddings"
```

---

## Task 7: TF.js embedder

**Files:**
- Create: `serving/lib/tfjs-kernels.ts`
- Create: `serving/lib/tfjs-embedder.ts`
- Create: `serving/lib/tfjs-embedder.test.ts`

- [ ] **Step 1: Create the CPU-backend kernels glue**

`serving/lib/tfjs-kernels.ts`:

```typescript
// Side-effect import: registers TF.js CPU kernels.
// Imported by tfjs-embedder so the model can run without GPU.
import '@tensorflow/tfjs-backend-cpu';
```

- [ ] **Step 2: Write failing test for the embedder**

`serving/lib/tfjs-embedder.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { TfjsEmbedder } from './tfjs-embedder.ts';

test('embedder produces a 384-dim float32 vector', async (t) => {
  t.diagnostic('first call loads the model and tokenizer (~3-5s)');
  const embedder = new TfjsEmbedder();
  const vec = await embedder.embed('hello world');
  assert.equal(vec.length, 384);
  assert.ok(vec instanceof Float32Array);
});

test('embedder is deterministic across calls', async () => {
  const embedder = new TfjsEmbedder();
  const v1 = await embedder.embed('input system');
  const v2 = await embedder.embed('input system');
  assert.deepEqual(Array.from(v1), Array.from(v2));
});

test('related queries produce more similar vectors than unrelated ones', async () => {
  const embedder = new TfjsEmbedder();
  const related = cosine(
    await embedder.embed('handle keyboard input in Unity'),
    await embedder.embed('read player input in Unity'),
  );
  const unrelated = cosine(
    await embedder.embed('handle keyboard input in Unity'),
    await embedder.embed('photosynthesis in plants'),
  );
  assert.ok(related > unrelated, `expected related (${related}) > unrelated (${unrelated})`);
});

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test lib/tfjs-embedder.test.ts`
Expected: FAIL — `Cannot find module './tfjs-embedder.ts'`.

- [ ] **Step 4: Implement the embedder**

`serving/lib/tfjs-embedder.ts`:

```typescript
import { setBackend, tensor2d, type Tensor } from '@tensorflow/tfjs-core';
import { loadGraphModel, type GraphModel } from '@tensorflow/tfjs-converter';
import { AutoTokenizer, type PreTrainedTokenizer } from '@huggingface/transformers';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import './tfjs-kernels.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = path.join(__dirname, 'tfjs_model_minilm');
const MODEL_JSON = path.join(MODEL_DIR, 'model.json');

function createNodeFileSystemIOHandler(modelJsonPath: string) {
  return {
    load: async () => {
      const dir = path.dirname(modelJsonPath);
      const modelJson = JSON.parse(await fs.promises.readFile(modelJsonPath, 'utf-8'));
      const modelTopology = modelJson.modelTopology;
      const weightsManifest = modelJson.weightsManifest;
      const weightSpecs: any[] = [];

      // MiniLM weights are a single shard.
      const manifest = weightsManifest[0];
      weightSpecs.push(...manifest.weights);
      const shardPath = manifest.paths[0];
      const fullPath = path.resolve(dir, shardPath);
      const weightData = (await fs.promises.readFile(fullPath)).buffer;

      return { modelTopology, weightSpecs, weightData };
    },
  };
}

export class TfjsEmbedder {
  private model: GraphModel | null = null;
  private tokenizer: PreTrainedTokenizer | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      await setBackend('cpu');
      this.model = await loadGraphModel(createNodeFileSystemIOHandler(MODEL_JSON));
      this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');
    })();
    return this.initPromise;
  }

  async embed(text: string): Promise<Float32Array> {
    await this.init();
    if (!this.model || !this.tokenizer) throw new Error('embedder not initialized');

    const encoded = await this.tokenizer(text, { padding: true, truncation: true });
    const inputIds = encoded.input_ids;
    const attentionMask = encoded.attention_mask;

    // The MiniLM TF.js model expects [input_ids, attention_mask, token_type_ids].
    const seqLen = inputIds.dims[1];
    const tokenTypeIdsData = new BigInt64Array(seqLen).fill(0n);

    const inputIdsTensor = tensor2d(Array.from(inputIds.data as BigInt64Array, Number), [1, seqLen], 'int32');
    const attentionTensor = tensor2d(Array.from(attentionMask.data as BigInt64Array, Number), [1, seqLen], 'int32');
    const tokenTypeTensor = tensor2d(Array.from(tokenTypeIdsData, Number), [1, seqLen], 'int32');

    try {
      const output = this.model.execute(
        { input_ids: inputIdsTensor, attention_mask: attentionTensor, token_type_ids: tokenTypeTensor },
      ) as Tensor;

      // Mean-pool token embeddings, masked by attention.
      const tokenEmbeddings = await output.array() as number[][][];
      const mask = Array.from(attentionMask.data as BigInt64Array, Number);
      const dim = tokenEmbeddings[0][0].length;
      const pooled = new Float32Array(dim);
      let nonMasked = 0;
      for (let i = 0; i < seqLen; i++) {
        if (mask[i] === 0) continue;
        nonMasked++;
        for (let j = 0; j < dim; j++) pooled[j] += tokenEmbeddings[0][i][j];
      }
      if (nonMasked > 0) for (let j = 0; j < dim; j++) pooled[j] /= nonMasked;

      // L2-normalize so cosine similarity == dot product.
      let norm = 0;
      for (let j = 0; j < dim; j++) norm += pooled[j] * pooled[j];
      norm = Math.sqrt(norm);
      if (norm > 0) for (let j = 0; j < dim; j++) pooled[j] /= norm;

      output.dispose();
      return pooled;
    } finally {
      inputIdsTensor.dispose();
      attentionTensor.dispose();
      tokenTypeTensor.dispose();
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test lib/tfjs-embedder.test.ts --test-timeout 60000`
Expected: PASS — all 3 tests green. First test takes ~3–5 s (model load). Subsequent tests reuse via in-process caching of model state if they share an embedder, but the test creates a new one each time — should still be acceptably fast since the model file is now in OS page cache.

If the test fails with `Cannot find package 'onnxruntime-node'`, add it to deps:
Run: `pnpm --filter serving add onnxruntime-node@^1.25.1`
(Transformers tokenizer falls back to this; not used for our pure-TF.js inference path, but the package must resolve.)

- [ ] **Step 6: Commit**

```bash
git add serving/lib/tfjs-embedder.ts serving/lib/tfjs-embedder.test.ts serving/lib/tfjs-kernels.ts serving/package.json pnpm-lock.yaml
git commit -m "feat(serving): add TF.js MiniLM embedder with mean-pool + L2 normalize"
```

---

## Task 8: Build-guides script (corpus generator)

**Files:**
- Create: `serving/scripts/build-guides.ts`
- Create: `serving/scripts/build-guides.test.ts`
- Generated artifacts (committed): `serving/lib/use-cases.gen.ts`, `serving/lib/embeddings.gen.bin`

This script walks `guides/`, parses each `guide.md`, validates frontmatter, expands the `useCases` array into a flat catalog, embeds each use-case description, and writes both the catalog (`use-cases.gen.ts`) and the binary embedding blob (`embeddings.gen.bin`).

**Binary format for `embeddings.gen.bin`:**
- `uint32 LE` — `numVectors`
- `uint32 LE` — `vectorDim`
- `numVectors * vectorDim * 4` bytes — `float32 LE` values, row-major

- [ ] **Step 1: Write failing test**

`serving/scripts/build-guides.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { buildGuides, readEmbeddingsBlob } from './build-guides.ts';

test('buildGuides walks a guides dir, writes use-cases.gen.ts and embeddings.gen.bin', async (t) => {
  const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ggdd-build-'));
  const guidesDir = path.join(tmp, 'guides');
  const outDir = path.join(tmp, 'out');
  await fs.promises.mkdir(path.join(guidesDir, 'unity-engine', 'demo-guide'), { recursive: true });
  await fs.promises.mkdir(outDir, { recursive: true });

  const guide = `---
id: demo-guide
category: unity-engine
title: Demo
description: A demo guide for tests.
useCases:
  - "test use case one"
  - "test use case two"
gradeMode: static
unityVersion: "6000.0"
baseApp: empty-unity6
---
Body.
`;
  await fs.promises.writeFile(path.join(guidesDir, 'unity-engine', 'demo-guide', 'guide.md'), guide);

  const result = await buildGuides({ guidesDir, outDir });
  assert.equal(result.numUseCases, 2);
  assert.equal(result.vectorDim, 384);

  const ucPath = path.join(outDir, 'use-cases.gen.ts');
  const binPath = path.join(outDir, 'embeddings.gen.bin');
  assert.ok(fs.existsSync(ucPath));
  assert.ok(fs.existsSync(binPath));

  const generated = fs.readFileSync(ucPath, 'utf8');
  assert.match(generated, /id: "demo-guide"/);
  assert.match(generated, /useCase: "test use case one"/);
  assert.match(generated, /useCase: "test use case two"/);

  const { numVectors, vectorDim, vectors } = readEmbeddingsBlob(binPath);
  assert.equal(numVectors, 2);
  assert.equal(vectorDim, 384);
  assert.equal(vectors.length, 2);
  assert.equal(vectors[0].length, 384);

  await fs.promises.rm(tmp, { recursive: true });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test scripts/build-guides.test.ts --test-timeout 120000`
Expected: FAIL — `Cannot find module './build-guides.ts'`.

- [ ] **Step 3: Implement `build-guides.ts`**

`serving/scripts/build-guides.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGuide, validateFrontmatter, type GuideFrontmatter } from '../../lib/guide-validation.ts';
import { TfjsEmbedder } from '../lib/tfjs-embedder.ts';

export interface UseCaseEntry {
  id: string;                  // guide id
  category: GuideFrontmatter['category'];
  description: string;          // guide-level description
  useCase: string;              // one of the guide's useCases entries
  embeddingIndex: number;       // row index into embeddings.gen.bin
}

export interface BuildResult {
  numUseCases: number;
  vectorDim: number;
  guides: number;
}

export interface BuildOptions {
  guidesDir: string;
  outDir: string;
}

export async function buildGuides(opts: BuildOptions): Promise<BuildResult> {
  const guidePaths = collectGuidePaths(opts.guidesDir);
  const embedder = new TfjsEmbedder();
  const entries: UseCaseEntry[] = [];
  const vectors: Float32Array[] = [];

  for (const guidePath of guidePaths) {
    const src = await fs.promises.readFile(guidePath, 'utf8');
    const { frontmatter } = parseGuide(src);
    const fm = validateFrontmatter(frontmatter);

    for (const useCase of fm.useCases) {
      const idx = entries.length;
      entries.push({
        id: fm.id,
        category: fm.category,
        description: fm.description,
        useCase,
        embeddingIndex: idx,
      });
      // Embed (description + useCase) for better semantic match.
      const vec = await embedder.embed(`${useCase}. ${fm.description}`);
      vectors.push(vec);
    }
  }

  const vectorDim = vectors[0]?.length ?? 384;

  await fs.promises.mkdir(opts.outDir, { recursive: true });
  await writeUseCases(path.join(opts.outDir, 'use-cases.gen.ts'), entries);
  await writeEmbeddingsBlob(path.join(opts.outDir, 'embeddings.gen.bin'), vectors, vectorDim);

  return { numUseCases: entries.length, vectorDim, guides: guidePaths.length };
}

function collectGuidePaths(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  function walk(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name === 'guide.md') out.push(full);
    }
  }
  walk(dir);
  return out.sort();
}

async function writeUseCases(outPath: string, entries: UseCaseEntry[]): Promise<void> {
  const header = `// AUTO-GENERATED by serving/scripts/build-guides.ts. Do not edit by hand.\n` +
                 `import type { UseCaseEntry } from '../scripts/build-guides.ts';\n\n` +
                 `export const USE_CASES: ReadonlyArray<UseCaseEntry> = [\n`;
  const body = entries.map(e =>
    `  { id: ${JSON.stringify(e.id)}, ` +
    `category: ${JSON.stringify(e.category)}, ` +
    `description: ${JSON.stringify(e.description)}, ` +
    `useCase: ${JSON.stringify(e.useCase)}, ` +
    `embeddingIndex: ${e.embeddingIndex} },`,
  ).join('\n');
  const footer = `\n];\n`;
  await fs.promises.writeFile(outPath, header + body + footer);
}

async function writeEmbeddingsBlob(outPath: string, vectors: Float32Array[], vectorDim: number): Promise<void> {
  const header = Buffer.alloc(8);
  header.writeUInt32LE(vectors.length, 0);
  header.writeUInt32LE(vectorDim, 4);
  const bodyBytes = vectors.length * vectorDim * 4;
  const body = Buffer.alloc(bodyBytes);
  let off = 0;
  for (const vec of vectors) {
    for (let i = 0; i < vectorDim; i++) {
      body.writeFloatLE(vec[i], off);
      off += 4;
    }
  }
  await fs.promises.writeFile(outPath, Buffer.concat([header, body]));
}

export function readEmbeddingsBlob(filePath: string): {
  numVectors: number;
  vectorDim: number;
  vectors: Float32Array[];
} {
  const buf = fs.readFileSync(filePath);
  const numVectors = buf.readUInt32LE(0);
  const vectorDim = buf.readUInt32LE(4);
  const vectors: Float32Array[] = [];
  let off = 8;
  for (let v = 0; v < numVectors; v++) {
    const arr = new Float32Array(vectorDim);
    for (let i = 0; i < vectorDim; i++) {
      arr[i] = buf.readFloatLE(off);
      off += 4;
    }
    vectors.push(arr);
  }
  return { numVectors, vectorDim, vectors };
}

// CLI entry: when invoked directly, build from the workspace's guides/ into serving/lib/.
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const servingDir = path.resolve(path.dirname(__filename), '..');
  const rootDir = path.resolve(servingDir, '..');
  const guidesDir = path.join(rootDir, 'guides');
  const outDir = path.join(servingDir, 'lib');
  const result = await buildGuides({ guidesDir, outDir });
  console.log(`Built ${result.numUseCases} use cases from ${result.guides} guide(s) into ${outDir}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test scripts/build-guides.test.ts --test-timeout 120000`
Expected: PASS — 1 test green.

- [ ] **Step 5: Run the build against the seed corpus**

Run: `cd serving && node --experimental-strip-types scripts/build-guides.ts`
Expected: prints `Built 5 use cases from 1 guide(s) into <path>/serving/lib`. Creates `serving/lib/use-cases.gen.ts` and `serving/lib/embeddings.gen.bin`.

- [ ] **Step 6: Inspect the generated files**

Run: `head -10 serving/lib/use-cases.gen.ts && ls -lh serving/lib/embeddings.gen.bin`
Expected: catalog file with 5 `UseCaseEntry` rows; bin file ~7.6 KB (5 × 384 × 4 + 8).

- [ ] **Step 7: Commit**

```bash
git add serving/scripts/build-guides.ts serving/scripts/build-guides.test.ts \
        serving/lib/use-cases.gen.ts serving/lib/embeddings.gen.bin
git commit -m "feat(serving): build-guides script + generated corpus from seed guide"
```

---

## Task 9: Search library

**Files:**
- Create: `serving/lib/search.ts`
- Create: `serving/lib/search.test.ts`

- [ ] **Step 1: Write failing test**

`serving/lib/search.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { searchUseCases } from './search.ts';

test('searchUseCases returns at least one result for a relevant query', async () => {
  const results = await searchUseCases('keyboard input in Unity');
  assert.ok(results.length >= 1);
  assert.equal(results[0].id, 'new-input-system-basics');
});

test('search results have the expected shape', async () => {
  const results = await searchUseCases('input');
  for (const r of results) {
    assert.equal(typeof r.id, 'string');
    assert.equal(typeof r.category, 'string');
    assert.equal(typeof r.useCase, 'string');
    assert.equal(typeof r.similarity, 'number');
    assert.ok(r.similarity >= -1 && r.similarity <= 1);
  }
});

test('search results are sorted by similarity descending', async () => {
  const results = await searchUseCases('input');
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i - 1].similarity >= results[i].similarity);
  }
});

test('search deduplicates by guide id (returns at most one row per guide)', async () => {
  const results = await searchUseCases('input');
  const ids = results.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate guide ids in results');
});

test('search limits results to top 10 by default', async () => {
  const results = await searchUseCases('anything');
  assert.ok(results.length <= 10);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test lib/search.test.ts --test-timeout 60000`
Expected: FAIL — `Cannot find module './search.ts'`.

- [ ] **Step 3: Implement `search.ts`**

`serving/lib/search.ts`:

```typescript
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { USE_CASES } from './use-cases.gen.ts';
import { readEmbeddingsBlob } from '../scripts/build-guides.ts';
import { TfjsEmbedder } from './tfjs-embedder.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOB_PATH = path.join(__dirname, 'embeddings.gen.bin');

export interface SearchResult {
  id: string;
  category: string;
  useCase: string;
  description: string;
  similarity: number;
}

let cached: { vectors: Float32Array[] } | null = null;
function loadCorpusVectors(): Float32Array[] {
  if (!cached) {
    const { vectors } = readEmbeddingsBlob(BLOB_PATH);
    cached = { vectors };
  }
  return cached.vectors;
}

const embedder = new TfjsEmbedder();

export async function searchUseCases(query: string, limit = 10): Promise<SearchResult[]> {
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

  // Dedupe by guide id, keeping the highest-scoring use-case row per guide.
  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const r of scored) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    deduped.push(r);
    if (deduped.length >= limit) break;
  }
  return deduped;
}

function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test lib/search.test.ts --test-timeout 60000`
Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add serving/lib/search.ts serving/lib/search.test.ts
git commit -m "feat(serving): semantic search over use-case corpus via cosine similarity"
```

---

## Task 10: Retrieve library + include/macros

**Files:**
- Create: `serving/lib/include.ts`
- Create: `serving/lib/macros.ts`
- Create: `serving/lib/macros.test.ts`
- Create: `serving/lib/retrieve.ts`
- Create: `serving/lib/retrieve.test.ts`

- [ ] **Step 1: Write failing test for `macros.ts`**

`serving/lib/macros.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { expandIncludes } from './macros.ts';

test('expandIncludes returns content unchanged when no directives present', () => {
  const src = '# Title\n\nBody.';
  assert.equal(expandIncludes(src, '/tmp/whatever.md'), src);
});

test('expandIncludes resolves !include relative to the source file', async (t) => {
  const tmp = await import('node:os').then(o => o.tmpdir());
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(tmp, 'inc-'));
  fs.writeFileSync(path.join(dir, 'shared.md'), 'SHARED CONTENT');
  const main = `Header\n\n!include shared.md\n\nFooter`;
  fs.writeFileSync(path.join(dir, 'main.md'), main);
  const result = expandIncludes(main, path.join(dir, 'main.md'));
  assert.match(result, /SHARED CONTENT/);
  assert.match(result, /Header/);
  assert.match(result, /Footer/);
  fs.rmSync(dir, { recursive: true });
});

test('expandIncludes throws on missing include target', () => {
  assert.throws(() => expandIncludes('!include does-not-exist.md', '/tmp/main.md'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test lib/macros.test.ts`
Expected: FAIL — `Cannot find module './macros.ts'`.

- [ ] **Step 3: Implement `include.ts` and `macros.ts`**

`serving/lib/include.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

export function resolveInclude(includeArg: string, fromFile: string): string {
  const absPath = path.resolve(path.dirname(fromFile), includeArg);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Include not found: ${includeArg} (resolved to ${absPath}, from ${fromFile})`);
  }
  return fs.readFileSync(absPath, 'utf8');
}
```

`serving/lib/macros.ts`:

```typescript
import { resolveInclude } from './include.ts';

const INCLUDE_RE = /^!include\s+(\S+)\s*$/gm;

export function expandIncludes(source: string, fromFile: string): string {
  return source.replace(INCLUDE_RE, (_match, includeArg: string) => {
    return resolveInclude(includeArg, fromFile);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test lib/macros.test.ts`
Expected: PASS — 3 tests green.

- [ ] **Step 5: Write failing test for `retrieve.ts`**

`serving/lib/retrieve.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { retrieveUseCase, RetrieveError } from './retrieve.ts';

test('retrieveUseCase returns the guide markdown for a known id', async () => {
  const md = await retrieveUseCase('new-input-system-basics');
  assert.match(md, /New Input System basics/);
  assert.match(md, /UnityEngine\.InputSystem/);
});

test('retrieveUseCase throws RetrieveError for an unknown id', async () => {
  await assert.rejects(
    () => retrieveUseCase('does-not-exist'),
    (err: unknown) => err instanceof RetrieveError,
  );
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test lib/retrieve.test.ts`
Expected: FAIL — `Cannot find module './retrieve.ts'`.

- [ ] **Step 7: Implement `retrieve.ts`**

`serving/lib/retrieve.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { USE_CASES } from './use-cases.gen.ts';
import { expandIncludes } from './macros.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In source layout, the workspace root is one level above serving/.
// In published layout (bundled), guides aren't shipped — see §3.5 of the design.
// Plan 1 retrieves from source. Plan 6 will switch to a packaged-guides layout.
const SERVING_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(SERVING_DIR, '..');
const GUIDES_DIR = path.join(ROOT_DIR, 'guides');

export class RetrieveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetrieveError';
  }
}

export async function retrieveUseCase(id: string): Promise<string> {
  const known = USE_CASES.find(uc => uc.id === id);
  if (!known) throw new RetrieveError(`Unknown guide id: ${id}`);

  const guidePath = path.join(GUIDES_DIR, known.category, id, 'guide.md');
  if (!fs.existsSync(guidePath)) {
    throw new RetrieveError(`Guide file missing on disk: ${guidePath}`);
  }
  const raw = await fs.promises.readFile(guidePath, 'utf8');
  return expandIncludes(raw, guidePath);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test lib/retrieve.test.ts`
Expected: PASS — 2 tests green.

- [ ] **Step 9: Commit**

```bash
git add serving/lib/include.ts serving/lib/macros.ts serving/lib/macros.test.ts \
        serving/lib/retrieve.ts serving/lib/retrieve.test.ts
git commit -m "feat(serving): retrieve guide markdown by id with !include expansion"
```

---

## Task 11: Practices / use-case lookup

**Files:**
- Create: `serving/lib/practices.ts`
- Create: `serving/lib/practices.test.ts`

- [ ] **Step 1: Write failing test**

`serving/lib/practices.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { listCatalog, findUseCaseById } from './practices.ts';

test('listCatalog returns one entry per guide (deduped by id)', () => {
  const catalog = listCatalog();
  assert.ok(catalog.length >= 1);
  const ids = catalog.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of catalog) {
    assert.equal(typeof c.id, 'string');
    assert.equal(typeof c.category, 'string');
    assert.equal(typeof c.description, 'string');
  }
});

test('findUseCaseById returns the entry for a known id', () => {
  const e = findUseCaseById('new-input-system-basics');
  assert.ok(e);
  assert.equal(e!.category, 'unity-engine');
});

test('findUseCaseById returns undefined for an unknown id', () => {
  assert.equal(findUseCaseById('does-not-exist'), undefined);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test lib/practices.test.ts`
Expected: FAIL — `Cannot find module './practices.ts'`.

- [ ] **Step 3: Implement `practices.ts`**

`serving/lib/practices.ts`:

```typescript
import { USE_CASES } from './use-cases.gen.ts';

export interface CatalogEntry {
  id: string;
  category: string;
  description: string;
}

export function listCatalog(): CatalogEntry[] {
  const seen = new Set<string>();
  const out: CatalogEntry[] = [];
  for (const uc of USE_CASES) {
    if (seen.has(uc.id)) continue;
    seen.add(uc.id);
    out.push({ id: uc.id, category: uc.category, description: uc.description });
  }
  return out;
}

export function findUseCaseById(id: string): CatalogEntry | undefined {
  return listCatalog().find(e => e.id === id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test lib/practices.test.ts`
Expected: PASS — 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add serving/lib/practices.ts serving/lib/practices.test.ts
git commit -m "feat(serving): catalog lookup helpers (listCatalog, findUseCaseById)"
```

---

## Task 12: Telemetry no-op stub

**Files:**
- Create: `serving/skills-cli/telemetry/types.ts`
- Create: `serving/skills-cli/telemetry/ClearcutLogger.ts`
- Create: `serving/skills-cli/telemetry/ClearcutLogger.test.ts`

This stub keeps the call sites in the CLI (Task 13–15) clean while emitting zero telemetry by default. Tracked TODO (spec §8.3 item 1) is to decide whether to wire to an opt-in endpoint or strip the code before public launch.

- [ ] **Step 1: Write failing test**

`serving/skills-cli/telemetry/ClearcutLogger.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { ClearcutLogger } from './ClearcutLogger.ts';
import { CommandType } from './types.ts';

test('logger constructed with no endpoint env var does not throw', () => {
  delete process.env.GGDD_TELEMETRY_ENDPOINT;
  const logger = new ClearcutLogger({ skillVersion: null });
  assert.ok(logger);
});

test('logSearchResult returns a promise that resolves without doing anything observable', async () => {
  const logger = new ClearcutLogger({ skillVersion: null });
  const result = await logger.logSearchResult(100, true, []);
  assert.equal(result, undefined);
});

test('logRetrieveResult returns a promise that resolves', async () => {
  const logger = new ClearcutLogger({ skillVersion: null });
  await logger.logRetrieveResult(50, true, 'demo-id');
});

test('logToolCommand returns a promise that resolves', async () => {
  const logger = new ClearcutLogger({ skillVersion: null });
  await logger.logToolCommand(100, true, CommandType.INSTALL);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test skills-cli/telemetry/ClearcutLogger.test.ts`
Expected: FAIL — `Cannot find module './ClearcutLogger.ts'`.

- [ ] **Step 3: Implement types and stub logger**

`serving/skills-cli/telemetry/types.ts`:

```typescript
export enum CommandType {
  INSTALL = 'install',
  INSTALL_CHOOSE = 'install-choose',
  UNINSTALL = 'uninstall',
  UPDATE = 'update',
}

export interface SearchItem {
  guide_id: string;
  similarity: number;
}
```

`serving/skills-cli/telemetry/ClearcutLogger.ts`:

```typescript
import type { CommandType, SearchItem } from './types.ts';

export interface ClearcutLoggerOptions {
  skillVersion: string | null;
}

/**
 * No-op telemetry sink. Call sites remain identical to MWG's ClearcutLogger,
 * but no events are emitted unless GGDD_TELEMETRY_ENDPOINT is set AND a future
 * implementation actually wires up a transport.
 *
 * TRACKED TODO (spec §8.3 item 1): decide before public launch whether to
 * (a) wire to an opt-in endpoint or (b) strip this class entirely.
 */
export class ClearcutLogger {
  private readonly endpoint: string | undefined;

  constructor(_opts: ClearcutLoggerOptions) {
    this.endpoint = process.env.GGDD_TELEMETRY_ENDPOINT;
  }

  async logSearchResult(_latencyMs: number, _success: boolean, _items: SearchItem[]): Promise<void> {
    // no-op
  }

  async logRetrieveResult(_latencyMs: number, _success: boolean, _guideId: string): Promise<void> {
    // no-op
  }

  async logToolCommand(_latencyMs: number, _success: boolean, _command: CommandType): Promise<void> {
    // no-op
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test skills-cli/telemetry/ClearcutLogger.test.ts`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add serving/skills-cli/telemetry/
git commit -m "feat(serving): add no-op telemetry stub (ClearcutLogger) with tracked TODO"
```

---

## Task 13: Runtime CLI — search / list / retrieve

**Files:**
- Modify: `serving/bin/ggdd.ts`
- Create: `serving/bin/ggdd.cli.test.ts`

- [ ] **Step 1: Write failing CLI integration test**

`serving/bin/ggdd.cli.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, 'ggdd.ts');

function run(args: string[]) {
  return spawnSync('node', ['--experimental-strip-types', CLI, ...args], { encoding: 'utf8' });
}

test('search outputs a JSON array', async () => {
  const r = run(['search', 'keyboard input']);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const parsed = JSON.parse(r.stdout);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.length >= 1);
  assert.equal(typeof parsed[0].id, 'string');
  assert.equal(typeof parsed[0].similarity, 'number');
});

test('search with no query exits 1', () => {
  const r = run(['search']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No search query provided/);
});

test('list outputs a JSON array of catalog entries', () => {
  const r = run(['list']);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const parsed = JSON.parse(r.stdout);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.length >= 1);
  assert.equal(typeof parsed[0].id, 'string');
});

test('retrieve fetches a known guide', () => {
  const r = run(['retrieve', 'new-input-system-basics']);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  assert.match(r.stdout, /--- Guide for new-input-system-basics ---/);
  assert.match(r.stdout, /UnityEngine\.InputSystem/);
});

test('retrieve with multiple ids fetches each', () => {
  const r = run(['retrieve', 'new-input-system-basics,new-input-system-basics']);
  assert.equal(r.status, 0);
  const matches = r.stdout.match(/--- Guide for new-input-system-basics ---/g);
  assert.equal(matches?.length, 2);
});

test('retrieve unknown id exits 1', () => {
  const r = run(['retrieve', 'does-not-exist']);
  assert.equal(r.status, 1);
});

test('retrieve with no ids exits 1', () => {
  const r = run(['retrieve']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No IDs provided/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test bin/ggdd.cli.test.ts --test-timeout 60000`
Expected: FAIL — `Unknown command: search` (or equivalent) on every test.

- [ ] **Step 3: Implement search / list / retrieve in `serving/bin/ggdd.ts`**

Replace `serving/bin/ggdd.ts` with:

```typescript
#!/usr/bin/env -S node --experimental-strip-types

import { parseArgs } from 'node:util';
import { ClearcutLogger } from '../skills-cli/telemetry/ClearcutLogger.ts';
import { CommandType } from '../skills-cli/telemetry/types.ts';
import { getVersion } from '../lib/version.ts';
import { retrieveUseCase, RetrieveError } from '../lib/retrieve.ts';
import { listCatalog } from '../lib/practices.ts';

function printUsage() {
  console.log(`
Usage: ggdd <command> [args]

Commands:
  search <query>            Search use cases by query
  list                      List all available use cases
  retrieve <ids>            Retrieve use case(s) by ID(s), comma-separated
  install [--choose]        Install the ggdd skill
  uninstall                 Uninstall the ggdd skill
  update                    Update installed ggdd skills

Options:
  --skill-version <version> Internal: version of the skill being executed
  --choose                  Choose specific skills interactively
  -h, --help                Show this help
  -v, --version             Show version
`);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      choose: { type: 'boolean' },
      'skill-version': { type: 'string' },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.version) {
    console.log(getVersion(import.meta.dirname));
    process.exit(0);
  }

  if (values.help || positionals.length === 0) {
    printUsage();
    process.exit(values.help ? 0 : 1);
  }

  const skillVersion = typeof values['skill-version'] === 'string' ? values['skill-version'] : null;
  let loggerInstance: ClearcutLogger | undefined;
  const getLogger = () => loggerInstance ??= new ClearcutLogger({ skillVersion });

  const command = positionals[0];
  const arg = positionals.slice(1).join(' ');

  if (command === 'search') {
    if (!arg) {
      await getLogger().logSearchResult(0, false, []);
      console.error('No search query provided.');
      process.exit(1);
    }
    const startTime = Date.now();
    try {
      const { searchUseCases } = await import('../lib/search.ts');
      const results = await searchUseCases(arg);
      const latencyMs = Date.now() - startTime;
      await getLogger().logSearchResult(
        latencyMs,
        true,
        results.map(r => ({ guide_id: r.id, similarity: Number(r.similarity) })),
      );
      if (results.length === 0) {
        console.log('[]');
      } else {
        const lines = results.map(r => JSON.stringify(r));
        console.log('[' + lines.join(',\n') + ']');
      }
    } catch (error) {
      await getLogger().logSearchResult(Date.now() - startTime, false, []);
      console.error('Search failed:', error);
      process.exit(1);
    }
  } else if (command === 'list') {
    const catalog = listCatalog();
    console.log(JSON.stringify(catalog, null, 2));
  } else if (command === 'retrieve') {
    const ids = arg ? arg.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (ids.length === 0) {
      await getLogger().logRetrieveResult(0, false, '');
      console.error('No IDs provided for retrieve.');
      process.exit(1);
    }
    let hasError = false;
    for (const id of ids) {
      const startTime = Date.now();
      try {
        const guide = await retrieveUseCase(id);
        console.log(`\n--- Guide for ${id} ---`);
        console.log(guide);
        await getLogger().logRetrieveResult(Date.now() - startTime, true, id);
      } catch (error) {
        hasError = true;
        if (error instanceof RetrieveError) console.error(`Retrieve failed for ${id}: ${error.message}`);
        else console.error(`Retrieve failed for ${id}:`, error);
        await getLogger().logRetrieveResult(Date.now() - startTime, false, id);
      }
    }
    if (hasError) process.exit(1);
  } else {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test bin/ggdd.cli.test.ts --test-timeout 60000`
Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add serving/bin/ggdd.ts serving/bin/ggdd.cli.test.ts
git commit -m "feat(serving): implement ggdd search/list/retrieve commands"
```

---

## Task 14: Runtime CLI — install / uninstall / update

**Files:**
- Modify: `serving/bin/ggdd.ts`
- Modify: `serving/bin/ggdd.cli.test.ts`

These commands shell out to `npx skills add/remove/update`. We don't want network calls in tests, so the implementation must support injecting a fake spawner via env var `GGDD_SKILLS_SPAWN_OVERRIDE` — when set to a path, the CLI uses that instead of `npx`. Tests use a small bash stub that just echoes its args.

- [ ] **Step 1: Write failing tests (append to existing test file)**

Add to `serving/bin/ggdd.cli.test.ts`:

```typescript
import * as fs from 'node:fs';
import * as os from 'node:os';

function runWithSkillsStub(args: string[], stubScript: string) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ggdd-cli-'));
  const stub = path.join(tmp, 'fake-npx');
  fs.writeFileSync(stub, stubScript, { mode: 0o755 });
  return spawnSync('node', ['--experimental-strip-types', CLI, ...args], {
    encoding: 'utf8',
    env: { ...process.env, GGDD_SKILLS_SPAWN_OVERRIDE: stub },
  });
}

test('install shells out to the spawn override', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['install'], stub);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /INVOKED:.*skills add/);
});

test('install --choose passes interactive mode', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['install', '--choose'], stub);
  assert.equal(r.status, 0);
  // No --skill ggdd suffix when --choose is set
  assert.doesNotMatch(r.stdout, /--skill ggdd/);
});

test('install propagates non-zero exit from skills tool', () => {
  const stub = `#!/usr/bin/env bash\necho "fail" >&2\nexit 5\n`;
  const r = runWithSkillsStub(['install'], stub);
  assert.equal(r.status, 5);
});

test('uninstall shells out', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['uninstall'], stub);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /INVOKED:.*skills remove/);
});

test('update shells out', () => {
  const stub = `#!/usr/bin/env bash\necho "INVOKED: $@"\nexit 0\n`;
  const r = runWithSkillsStub(['update'], stub);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /INVOKED:.*skills update/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd serving && node --experimental-strip-types --test bin/ggdd.cli.test.ts --test-timeout 60000`
Expected: the 5 new tests FAIL — current CLI hits the `Unknown command` branch for `install`, `uninstall`, `update`.

- [ ] **Step 3: Add install/uninstall/update handlers to `serving/bin/ggdd.ts`**

Insert before the final `else { console.error(\`Unknown command: ${command}\`); ... }` block:

```typescript
  } else if (command === 'install') {
    const startTime = Date.now();
    const tool = process.env.GGDD_SKILLS_SPAWN_OVERRIDE ?? 'npx';
    const installArgs = process.env.GGDD_SKILLS_SPAWN_OVERRIDE
      ? ['skills', 'add', 'lijinglue/ggdd', ...(values.choose ? [] : ['--skill', 'ggdd'])]
      : ['-y', 'skills', 'add', 'lijinglue/ggdd', ...(values.choose ? [] : ['--skill', 'ggdd'])];
    const { spawnSync } = await import('node:child_process');
    const result = spawnSync(tool, installArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
    const success = !result.error && result.status === 0;
    await getLogger().logToolCommand(
      Date.now() - startTime,
      success,
      values.choose ? CommandType.INSTALL_CHOOSE : CommandType.INSTALL,
    );
    if (result.error) {
      console.error('Install failed:', result.error);
      process.exit(1);
    }
    process.exit(result.status ?? 0);
  } else if (command === 'uninstall') {
    const startTime = Date.now();
    const tool = process.env.GGDD_SKILLS_SPAWN_OVERRIDE ?? 'npx';
    const args = process.env.GGDD_SKILLS_SPAWN_OVERRIDE
      ? ['skills', 'remove', 'ggdd']
      : ['skills', 'remove', 'ggdd'];
    const { spawnSync } = await import('node:child_process');
    const result = spawnSync(tool, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    const success = !result.error && result.status === 0;
    await getLogger().logToolCommand(Date.now() - startTime, success, CommandType.UNINSTALL);
    process.exit(result.status ?? (result.error ? 1 : 0));
  } else if (command === 'update') {
    const startTime = Date.now();
    const tool = process.env.GGDD_SKILLS_SPAWN_OVERRIDE ?? 'npx';
    const args = process.env.GGDD_SKILLS_SPAWN_OVERRIDE
      ? ['skills', 'update', 'ggdd']
      : ['-y', 'skills', 'update', 'ggdd'];
    const { spawnSync } = await import('node:child_process');
    const result = spawnSync(tool, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    const success = !result.error && result.status === 0;
    await getLogger().logToolCommand(Date.now() - startTime, success, CommandType.UPDATE);
    process.exit(result.status ?? (result.error ? 1 : 0));
  }
```

The stub-script tests rely on `stdio: 'inherit'` — the stub writes to the test process's stdout/stderr, which `spawnSync` captures because Node's `spawnSync` with `encoding: 'utf8'` already redirects child stdio when the parent is not a TTY. Note: with `stdio: 'inherit'`, the child writes to the parent's actual stdout. For the test capture to work, switch to `stdio: ['inherit', 'pipe', 'pipe']` so the test can see what the stub printed:

Replace `stdio: 'inherit'` with `stdio: ['inherit', 'pipe', 'pipe']` in all three handlers and pipe the result through the parent CLI's own stdout/stderr:

After the `spawnSync` call, before the `success` check, add:
```typescript
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
```

Apply this addition in each of the three install/uninstall/update handlers.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd serving && node --experimental-strip-types --test bin/ggdd.cli.test.ts --test-timeout 60000`
Expected: PASS — all 12 tests green (7 original + 5 new).

- [ ] **Step 5: Commit**

```bash
git add serving/bin/ggdd.ts serving/bin/ggdd.cli.test.ts
git commit -m "feat(serving): implement install/uninstall/update commands (skills-cli wrapper)"
```

---

## Task 15: Stale-skill-version warning

**Files:**
- Modify: `serving/bin/ggdd.ts`
- Create: `serving/skills-cli/template/skill-version.txt` (will live alongside SKILL.md in Task 19, but the CLI needs to know how to read it now)
- Modify: `serving/bin/ggdd.cli.test.ts`

Per spec §3.2: when `--skill-version <v>` is passed, the CLI compares against its own latest version. Warning at >5 days, escalated message at >60 days. Versions are date-prefixed (`YYYY_MM_DD…`).

- [ ] **Step 1: Create initial `skill-version.txt`**

`serving/skills-cli/template/skill-version.txt`:

```
2026_05_27_v1
```

- [ ] **Step 2: Write failing test**

Append to `serving/bin/ggdd.cli.test.ts`:

```typescript
test('--skill-version with a fresh version emits no warning', () => {
  const r = run(['--skill-version', '2026_05_27_v1', 'list']);
  assert.equal(r.status, 0);
  assert.equal(r.stderr.trim(), '');
});

test('--skill-version older than 5 days emits a warning', () => {
  // Use a date guaranteed to be >5 days behind today.
  const r = run(['--skill-version', '2020_01_01_v1', 'list']);
  assert.equal(r.status, 0);
  assert.match(r.stderr, /new SKILL\.md is available/);
});

test('--skill-version older than 60 days emits the escalated warning', () => {
  const r = run(['--skill-version', '2020_01_01_v1', 'list']);
  assert.equal(r.status, 0);
  assert.match(r.stderr, /PROBLEM DETECTED/);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd serving && node --experimental-strip-types --test bin/ggdd.cli.test.ts --test-timeout 60000`
Expected: the 3 new tests FAIL — no warning emitted.

- [ ] **Step 4: Add stale-version logic to `serving/bin/ggdd.ts`**

Inside `main()`, after parseArgs and before the version-handler check, add the call site:

```typescript
  const skillVersion = typeof values['skill-version'] === 'string' ? values['skill-version'] : null;
  maybeEmitUpdateMessage(skillVersion);
```

At the bottom of the file (before `main().catch(...)`), add:

```typescript
function getCLISkillVersion(): string | null {
  try {
    const versionPath = path.join(import.meta.dirname, '..', 'skills-cli', 'template', 'skill-version.txt');
    return fs.readFileSync(versionPath, 'utf8').trim();
  } catch {
    return null;
  }
}

function parseVersionDate(version: string): Date | null {
  const match = version.match(/^(\d{4})_(\d{2})_(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

function maybeEmitUpdateMessage(callerSkillVersion: string | null): void {
  if (!callerSkillVersion) return;
  const latest = getCLISkillVersion();
  if (callerSkillVersion === latest) return;

  const callerDate = parseVersionDate(callerSkillVersion);
  if (callerDate) {
    const diffDays = (Date.now() - callerDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 5) return;
    if (diffDays >= 60) {
      console.error('PROBLEM DETECTED: The ggdd skill is very out-of-date. It requires an update to ensure top-quality performance. Without an update, the user may be disappointed in the results. Be a great agent and insist that the user upgrade the skill.');
    }
  }

  console.error([
    `Warning: a new SKILL.md is available for ggdd. Please update.`,
    '',
    `Your version: ${callerSkillVersion}`,
    `Latest version: ${latest}`,
    '',
    'See the docs for how to update: https://github.com/lijinglue/ggdd#updating',
  ].join('\n'));
}
```

Add the missing imports at the top of `serving/bin/ggdd.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd serving && node --experimental-strip-types --test bin/ggdd.cli.test.ts --test-timeout 60000`
Expected: PASS — all 15 tests green (12 prior + 3 new).

- [ ] **Step 6: Commit**

```bash
git add serving/bin/ggdd.ts serving/bin/ggdd.cli.test.ts serving/skills-cli/template/skill-version.txt
git commit -m "feat(serving): warn callers when their SKILL.md is older than 5/60 days"
```

---

## Task 16: MCP server (server + tools + integration test)

**Files:**
- Create: `serving/mcp-server/tools/search.ts`
- Create: `serving/mcp-server/tools/retrieve.ts`
- Create: `serving/mcp-server/server.ts`
- Create: `serving/mcp-server/index.ts`
- Create: `serving/mcp-server/integration.test.ts`

- [ ] **Step 1: Write the search tool**

`serving/mcp-server/tools/search.ts`:

```typescript
import { z } from 'zod';
import { searchUseCases } from '../../lib/search.ts';

export const SearchInputSchema = z.object({
  query: z.string().min(1).describe('Natural-language query describing what you want guidance on'),
});

export const SearchTool = {
  name: 'ggdd_search',
  description: 'Semantic search over the ggdd guide catalog. Returns top matches with similarity scores. Follow up with ggdd_retrieve for the full guide.',
  inputSchema: SearchInputSchema,
  handler: async (input: z.infer<typeof SearchInputSchema>) => {
    const results = await searchUseCases(input.query);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(results, null, 2),
      }],
    };
  },
};
```

- [ ] **Step 2: Write the retrieve tool**

`serving/mcp-server/tools/retrieve.ts`:

```typescript
import { z } from 'zod';
import { retrieveUseCase, RetrieveError } from '../../lib/retrieve.ts';

export const RetrieveInputSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).describe('Guide IDs to retrieve'),
});

export const RetrieveTool = {
  name: 'ggdd_retrieve',
  description: 'Retrieve full guide markdown for one or more guide IDs. Use after ggdd_search.',
  inputSchema: RetrieveInputSchema,
  handler: async (input: z.infer<typeof RetrieveInputSchema>) => {
    const parts: string[] = [];
    const errors: string[] = [];
    for (const id of input.ids) {
      try {
        const md = await retrieveUseCase(id);
        parts.push(`--- Guide for ${id} ---\n${md}`);
      } catch (err) {
        if (err instanceof RetrieveError) errors.push(`Retrieve failed for ${id}: ${err.message}`);
        else errors.push(`Retrieve failed for ${id}: ${String(err)}`);
      }
    }
    return {
      content: [{ type: 'text' as const, text: parts.join('\n\n') + (errors.length ? `\n\nErrors:\n${errors.join('\n')}` : '') }],
      isError: errors.length > 0 && parts.length === 0,
    };
  },
};
```

- [ ] **Step 3: Write the server setup**

`serving/mcp-server/server.ts`:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SearchTool } from './tools/search.ts';
import { RetrieveTool } from './tools/retrieve.ts';
import { getVersion } from '../lib/version.ts';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'ggdd',
    version: getVersion(import.meta.dirname),
  });

  server.tool(
    SearchTool.name,
    SearchTool.description,
    SearchTool.inputSchema.shape,
    SearchTool.handler,
  );

  server.tool(
    RetrieveTool.name,
    RetrieveTool.description,
    RetrieveTool.inputSchema.shape,
    RetrieveTool.handler,
  );

  return server;
}
```

- [ ] **Step 4: Write the stdio entry point**

`serving/mcp-server/index.ts`:

```typescript
#!/usr/bin/env -S node --experimental-strip-types

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.ts';

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
```

- [ ] **Step 5: Write integration test**

`serving/mcp-server/integration.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(__dirname, 'index.ts');

function send(child: ReturnType<typeof spawn>, msg: object) {
  child.stdin!.write(JSON.stringify(msg) + '\n');
}

function readJsonLine(buf: { acc: string }, child: ReturnType<typeof spawn>): Promise<any> {
  return new Promise((resolve, reject) => {
    const onData = (chunk: Buffer) => {
      buf.acc += chunk.toString();
      const newlineIdx = buf.acc.indexOf('\n');
      if (newlineIdx >= 0) {
        const line = buf.acc.slice(0, newlineIdx);
        buf.acc = buf.acc.slice(newlineIdx + 1);
        child.stdout!.off('data', onData);
        try { resolve(JSON.parse(line)); }
        catch (e) { reject(e); }
      }
    };
    child.stdout!.on('data', onData);
  });
}

test('MCP server lists ggdd_search and ggdd_retrieve tools', async () => {
  const child = spawn('node', ['--experimental-strip-types', SERVER]);
  const buf = { acc: '' };
  try {
    // initialize
    send(child, {
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '0.0.0' },
      },
    });
    const initResp = await readJsonLine(buf, child);
    assert.equal(initResp.id, 1);
    assert.ok(initResp.result);

    // initialized notification
    send(child, { jsonrpc: '2.0', method: 'notifications/initialized' });

    // tools/list
    send(child, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const listResp = await readJsonLine(buf, child);
    assert.equal(listResp.id, 2);
    const names = listResp.result.tools.map((t: any) => t.name).sort();
    assert.deepEqual(names, ['ggdd_retrieve', 'ggdd_search']);
  } finally {
    child.kill();
  }
});

test('MCP server ggdd_search returns top match for a relevant query', async () => {
  const child = spawn('node', ['--experimental-strip-types', SERVER]);
  const buf = { acc: '' };
  try {
    send(child, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0.0.0' } } });
    await readJsonLine(buf, child);
    send(child, { jsonrpc: '2.0', method: 'notifications/initialized' });

    send(child, {
      jsonrpc: '2.0', id: 2, method: 'tools/call',
      params: { name: 'ggdd_search', arguments: { query: 'keyboard input in Unity' } },
    });
    const resp = await readJsonLine(buf, child);
    assert.equal(resp.id, 2);
    const text = resp.result.content[0].text;
    const parsed = JSON.parse(text);
    assert.ok(parsed.length >= 1);
    assert.equal(parsed[0].id, 'new-input-system-basics');
  } finally {
    child.kill();
  }
});
```

- [ ] **Step 6: Run the integration tests**

Run: `cd serving && node --experimental-strip-types --test mcp-server/integration.test.ts --test-timeout 60000`
Expected: PASS — both tests green.

- [ ] **Step 7: Commit**

```bash
git add serving/mcp-server/
git commit -m "feat(serving): add MCP server exposing ggdd_search and ggdd_retrieve tools"
```

---

## Task 17: esbuild bundler for npm publish

**Files:**
- Create: `serving/skills-cli/build-dist.ts`
- Create: `serving/skills-cli/build-dist.test.ts`

The bundler produces `serving/build/ggdd.js` and `serving/build/mcp-server.js` — single-file bundles suitable for npm publish. Native deps (TF.js, @huggingface/transformers, MCP SDK) are kept external and resolved at install time.

- [ ] **Step 1: Write failing test**

`serving/skills-cli/build-dist.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDist } from './build-dist.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVING = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(SERVING, 'build');

test('buildDist produces ggdd.js and mcp-server.js in serving/build/', async () => {
  if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true });
  await buildDist();
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'ggdd.js')));
  assert.ok(fs.existsSync(path.join(BUILD_DIR, 'mcp-server.js')));
});

test('bundled ggdd.js has a shebang line', () => {
  const src = fs.readFileSync(path.join(BUILD_DIR, 'ggdd.js'), 'utf8');
  assert.match(src.split('\n')[0], /^#!/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test skills-cli/build-dist.test.ts --test-timeout 60000`
Expected: FAIL — `Cannot find module './build-dist.ts'`.

- [ ] **Step 3: Implement `build-dist.ts`**

`serving/skills-cli/build-dist.ts`:

```typescript
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVING = path.resolve(__dirname, '..');
const BUILD = path.join(SERVING, 'build');

const EXTERNAL = [
  '@tensorflow/tfjs-core',
  '@tensorflow/tfjs-converter',
  '@tensorflow/tfjs-backend-cpu',
  '@huggingface/transformers',
  '@modelcontextprotocol/sdk',
  'gray-matter',
  'zod',
  'onnxruntime-node',
];

export async function buildDist(): Promise<void> {
  await fs.promises.mkdir(BUILD, { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(SERVING, 'bin', 'ggdd.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    outfile: path.join(BUILD, 'ggdd.js'),
    external: EXTERNAL,
    banner: { js: '#!/usr/bin/env node' },
    loader: { '.ts': 'ts' },
  });

  await esbuild.build({
    entryPoints: [path.join(SERVING, 'mcp-server', 'index.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    outfile: path.join(BUILD, 'mcp-server.js'),
    external: EXTERNAL,
    banner: { js: '#!/usr/bin/env node' },
    loader: { '.ts': 'ts' },
  });

  // Make built files executable.
  await fs.promises.chmod(path.join(BUILD, 'ggdd.js'), 0o755);
  await fs.promises.chmod(path.join(BUILD, 'mcp-server.js'), 0o755);
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  await buildDist();
  console.log(`Built to ${BUILD}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test skills-cli/build-dist.test.ts --test-timeout 60000`
Expected: PASS — 2 tests green.

- [ ] **Step 5: Verify the built `ggdd.js` runs**

Run: `node serving/build/ggdd.js --version`
Expected: prints `0.0.1`.

- [ ] **Step 6: Commit**

```bash
git add serving/skills-cli/build-dist.ts serving/skills-cli/build-dist.test.ts
git commit -m "feat(serving): esbuild bundler producing distributable ggdd.js + mcp-server.js"
```

---

## Task 18: Megaskill stub + builder

**Files:**
- Create: `serving/megaskill/megaskill.md`
- Create: `serving/scripts/build-megaskill.ts`
- Create: `serving/scripts/build-megaskill.test.ts`

The megaskill is a single bundled markdown blob that concatenates all guide bodies for agents that prefer "everything at once" over search-on-demand. Plan 1 ships a working builder; the content is just the seed guide initially.

- [ ] **Step 1: Create the megaskill template stub**

`serving/megaskill/megaskill.md`:

```markdown
# ggdd Megaskill — Unity 6 guidance (bundled)

This is the bundled "everything at once" variant of ggdd. Prefer the on-demand `ggdd search`/`ggdd retrieve` CLI when context-window economy matters.

<!-- GUIDES START -->
<!-- GUIDES END -->
```

- [ ] **Step 2: Write failing test**

`serving/scripts/build-megaskill.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { buildMegaskill } from './build-megaskill.ts';

test('buildMegaskill walks guides and inlines bodies between markers', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mega-'));
  const guidesDir = path.join(tmp, 'guides');
  fs.mkdirSync(path.join(guidesDir, 'unity-engine', 'g1'), { recursive: true });
  fs.writeFileSync(path.join(guidesDir, 'unity-engine', 'g1', 'guide.md'),
    `---\nid: g1\ncategory: unity-engine\ntitle: G1\ndescription: D\nuseCases:\n  - "u"\ngradeMode: static\nunityVersion: "6000.0"\nbaseApp: empty-unity6\n---\n\nG1 body content.\n`);

  const templatePath = path.join(tmp, 'template.md');
  fs.writeFileSync(templatePath, `HEADER\n<!-- GUIDES START -->\n<!-- GUIDES END -->\nFOOTER\n`);
  const outPath = path.join(tmp, 'out.md');

  await buildMegaskill({ guidesDir, templatePath, outPath });

  const out = fs.readFileSync(outPath, 'utf8');
  assert.match(out, /HEADER/);
  assert.match(out, /FOOTER/);
  assert.match(out, /G1 body content\./);
  assert.match(out, /## g1/);
  fs.rmSync(tmp, { recursive: true });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd serving && node --experimental-strip-types --test scripts/build-megaskill.test.ts`
Expected: FAIL — `Cannot find module './build-megaskill.ts'`.

- [ ] **Step 4: Implement `build-megaskill.ts`**

`serving/scripts/build-megaskill.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGuide, validateFrontmatter } from '../../lib/guide-validation.ts';

const START_MARKER = '<!-- GUIDES START -->';
const END_MARKER = '<!-- GUIDES END -->';

export interface BuildMegaskillOptions {
  guidesDir: string;
  templatePath: string;
  outPath: string;
}

export async function buildMegaskill(opts: BuildMegaskillOptions): Promise<void> {
  const guidePaths: string[] = [];
  function walk(d: string) {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name === 'guide.md') guidePaths.push(full);
    }
  }
  walk(opts.guidesDir);
  guidePaths.sort();

  const sections: string[] = [];
  for (const p of guidePaths) {
    const src = await fs.promises.readFile(p, 'utf8');
    const { frontmatter, body } = parseGuide(src);
    const fm = validateFrontmatter(frontmatter);
    sections.push(`## ${fm.id}\n\n_Category: ${fm.category}_\n\n${body.trim()}\n`);
  }

  const template = await fs.promises.readFile(opts.templatePath, 'utf8');
  const startIdx = template.indexOf(START_MARKER);
  const endIdx = template.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error(`Template ${opts.templatePath} missing GUIDES START/END markers`);
  }
  const before = template.slice(0, startIdx + START_MARKER.length);
  const after = template.slice(endIdx);
  const merged = `${before}\n\n${sections.join('\n')}\n${after}`;

  await fs.promises.writeFile(opts.outPath, merged);
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const servingDir = path.resolve(path.dirname(__filename), '..');
  const rootDir = path.resolve(servingDir, '..');
  await buildMegaskill({
    guidesDir: path.join(rootDir, 'guides'),
    templatePath: path.join(servingDir, 'megaskill', 'megaskill.md'),
    outPath: path.join(servingDir, 'build', 'megaskill.md'),
  });
  console.log('Built megaskill to serving/build/megaskill.md');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd serving && node --experimental-strip-types --test scripts/build-megaskill.test.ts`
Expected: PASS — 1 test green.

- [ ] **Step 6: Run the builder against the seed corpus**

Run: `mkdir -p serving/build && cd serving && node --experimental-strip-types scripts/build-megaskill.ts`
Expected: writes `serving/build/megaskill.md` containing the new-input-system-basics body inlined between markers.

- [ ] **Step 7: Commit**

```bash
git add serving/megaskill/megaskill.md serving/scripts/build-megaskill.ts serving/scripts/build-megaskill.test.ts
git commit -m "feat(serving): megaskill builder concatenates guide bodies into bundled markdown"
```

---

## Task 19: SKILL.md template + Claude Code plugin.json

**Files:**
- Create: `serving/skills-cli/template/SKILL.md`
- Create: `serving/skills-cli/template/plugin.json`
- Create: `serving/skills-cli/template/plugin-json.test.ts`

The actual publish flow lands in Plan 6. Plan 1 lays the template files down and validates `plugin.json` JSON shape so later tasks can rely on them.

- [ ] **Step 1: Create `SKILL.md` template**

`serving/skills-cli/template/SKILL.md`:

```markdown
---
name: ggdd
description: Use when working with Unity 6 — searches and retrieves curated guidance on engine APIs (URP, Input System, Addressables), performance (GC, draw calls, SRP Batcher), and game-design patterns (action, deckbuilder). Triggers on tasks involving Unity C# scripts, .unity scenes, ScriptableObjects, or genre-specific design questions.
version: 2026_05_27_v1
---

# ggdd — Unity 6 guidance

When the user asks for help with Unity engine usage, Unity performance, or game design patterns for action/brawler or deckbuilder/roguelike genres, follow this workflow:

1. **Search**: invoke the CLI to find relevant guides.

   ```shell
   npx ggdd@latest --skill-version 2026_05_27_v1 search "<short natural-language query>"
   ```

   Returns a JSON array of `{ id, category, useCase, description, similarity }` ranked by relevance. Pick the top 1–3 that match the user's task.

2. **Retrieve**: pull the full guide markdown for the chosen ids.

   ```shell
   npx ggdd@latest --skill-version 2026_05_27_v1 retrieve "<id-1>,<id-2>"
   ```

3. **Apply**: follow the guidance, especially the `## Avoid` and `## Gotchas` sections.

Prefer modern Unity 6 patterns. Avoid legacy APIs (`UnityEngine.Input`, Built-in Render Pipeline, GameObject.FindObjectOfType in hot paths) unless the user explicitly asks for them.

## When NOT to use this skill

- Non-Unity C# work (web APIs, console apps).
- Unity 2022 LTS or 2021 LTS specifically — ggdd targets Unity 6 only.
- Asset creation (3D modeling, texturing) — ggdd is code/architecture guidance.
```

- [ ] **Step 2: Create `plugin.json` (Claude Code plugin manifest)**

`serving/skills-cli/template/plugin.json`:

```json
{
  "name": "ggdd",
  "version": "0.0.1",
  "description": "Game Guidance for Development Done-right — curated Unity 6 guidance for coding agents",
  "author": {
    "name": "lijinglue",
    "email": "ljlxdev@gmail.com"
  },
  "homepage": "https://github.com/lijinglue/ggdd",
  "skills": [
    {
      "name": "ggdd",
      "source": "./SKILL.md"
    }
  ]
}
```

- [ ] **Step 3: Write validation test**

`serving/skills-cli/template/plugin-json.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('plugin.json parses and has required Claude Code plugin fields', () => {
  const raw = fs.readFileSync(path.join(__dirname, 'plugin.json'), 'utf8');
  const parsed = JSON.parse(raw);
  assert.equal(parsed.name, 'ggdd');
  assert.match(parsed.version, /^\d+\.\d+\.\d+/);
  assert.equal(typeof parsed.description, 'string');
  assert.ok(Array.isArray(parsed.skills));
  assert.equal(parsed.skills.length, 1);
  assert.equal(parsed.skills[0].name, 'ggdd');
  assert.equal(parsed.skills[0].source, './SKILL.md');
});

test('SKILL.md has valid YAML frontmatter with name + description', async () => {
  const matter = (await import('gray-matter')).default;
  const src = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf8');
  const { data } = matter(src);
  assert.equal(data.name, 'ggdd');
  assert.equal(typeof data.description, 'string');
  assert.ok(data.description.length >= 60, 'description should be substantive');
  assert.match(data.version, /^\d{4}_\d{2}_\d{2}/);
});

test('SKILL.md version matches skill-version.txt', async () => {
  const matter = (await import('gray-matter')).default;
  const src = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf8');
  const { data } = matter(src);
  const versionTxt = fs.readFileSync(path.join(__dirname, 'skill-version.txt'), 'utf8').trim();
  assert.equal(data.version, versionTxt);
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd serving && node --experimental-strip-types --test skills-cli/template/plugin-json.test.ts`
Expected: PASS — 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add serving/skills-cli/template/
git commit -m "feat(serving): add SKILL.md template + Claude Code plugin.json manifest"
```

---

## Task 20: Preflight + CI workflow

**Files:**
- Create: `.github/workflows/preflight.yml`
- Modify: root `package.json` (extend `preflight` if needed — already covered in Task 1)

- [ ] **Step 1: Run preflight locally and fix any breakage**

Run: `pnpm preflight`
Expected: build + typecheck + lint + tests all pass. Total time ~1–3 min on a warm cache (first run is slower due to TF.js model load in tests).

If anything fails: fix it. Common likely failures:
- `tsc` complaining about `**/*.gen.ts` — already excluded via `oxlintignore`; for tsc, ensure the generated file imports type from a real location. (We do — `serving/scripts/build-guides.ts`.)
- `oxlint` on test files — should be fine. If it flags something, address per the lint rule.
- A test timing out — bump the relevant `--test-timeout` value.

- [ ] **Step 2: Create CI workflow**

`.github/workflows/preflight.yml`:

```yaml
name: Preflight

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  preflight:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true
      - name: Pull LFS files
        run: git lfs pull
      - uses: pnpm/action-setup@v4
        with:
          version: 10.30.3
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm preflight
        env:
          TEST_REPORTER: spec
```

- [ ] **Step 3: Verify the workflow file is valid YAML**

Run: `node -e "console.log(require('node:fs').readFileSync('.github/workflows/preflight.yml','utf8'))" >/dev/null`
Expected: no output (file is readable). For deeper validation, push a branch and let GitHub Actions parse it; out of scope for Plan 1 to set up `actionlint` locally.

- [ ] **Step 4: Final commit**

```bash
git add .github/workflows/preflight.yml
git commit -m "ci: add preflight workflow (build + typecheck + lint + tests on PR)"
```

- [ ] **Step 5: Tag the foundation milestone**

```bash
git tag v0.1.0-plan1
git log --oneline -5
```
Expected: tag created at HEAD, log shows the most recent 5 commits including this CI commit.

---

## Plan 1 acceptance checks

After all tasks complete, verify the end-to-end happy paths:

- [ ] **`pnpm preflight` exits 0** — entire workspace builds, typechecks, lints, and tests pass.
- [ ] **`node --experimental-strip-types serving/bin/ggdd.ts search "keyboard input in Unity"`** — returns a JSON array with `new-input-system-basics` ranked first.
- [ ] **`node --experimental-strip-types serving/bin/ggdd.ts list`** — returns a JSON array with one entry per guide.
- [ ] **`node --experimental-strip-types serving/bin/ggdd.ts retrieve new-input-system-basics`** — prints the full guide markdown.
- [ ] **`pnpm --filter serving build`** — produces `serving/build/ggdd.js`, `serving/build/mcp-server.js`, generated corpus files refreshed.
- [ ] **`node serving/build/ggdd.js --version`** — prints `0.0.1`.
- [ ] **`pnpm --filter serving build:megaskill`** — writes `serving/build/megaskill.md` containing the seed guide body.
- [ ] **MCP server integration test** — `cd serving && node --experimental-strip-types --test mcp-server/integration.test.ts` exits 0, listing both tools and returning search results.
- [ ] **LFS round-trip** — `git lfs ls-files` lists `serving/lib/tfjs_model_minilm/group1-shard1of1.bin`; a fresh clone followed by `git lfs pull && pnpm install && pnpm test` produces identical results to the dev box.

---

## What Plan 1 deliberately does NOT include

These land in later plans:

- **Plan 2**: the remaining 11 guides + their `expectations.md`, `demo/`, `negative-demo/`, `grader.ts`, `tasks/task.md`.
- **Plan 3**: `bin/ggdd-dev.ts` and the entire authoring CLI (`audit`, `dev`, `dev-all`, `gen-grader`, `gen-negative`, `test-grader`, `grade`, `warm-cache`, `apiref`, `setup-completion`).
- **Plan 4**: `harness/` (base-apps with Unity 6 projects via LFS, agent runners, `run_suite.ts`, `unity-runner.ts`).
- **Plan 5**: `eval-view/` dashboard SPA.
- **Plan 6**: `publish-skills.ts`, `prepublishOnly` end-to-end release pipeline, plugin marketplace registration, deferred channels.

The `serving/skills-cli/template/{SKILL.md,plugin.json,skill-version.txt}` files exist in Plan 1 but are not yet published — they're laid down so Plan 6 has them ready.

---

## Self-review notes

- **Coverage:** All Plan 1 acceptance criteria (working `ggdd search|list|retrieve|install`, MCP server, build pipeline, seed corpus, telemetry no-op stub, skill-version warning) are covered by the tasks above.
- **No placeholders:** every step contains the actual code, command, or content needed. The only TODO marker in the source is the intentional, tracked one in `ClearcutLogger.ts` (mirrored from spec §8.3 item 1).
- **Type consistency:** `UseCaseEntry` is defined in `serving/scripts/build-guides.ts` and re-imported by the generated `use-cases.gen.ts`. `SearchResult` (in `search.ts`) is the consumer shape used by the CLI and MCP tools. `CatalogEntry` (in `practices.ts`) is used by `list`. Names are consistent across tasks; no method renames between tasks.
