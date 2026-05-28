import * as fs from 'node:fs';
import * as path from 'node:path';
import { complete } from './anthropic-client.ts';
import { cBold, cDim, cGreen } from '../lib/colors.ts';

const SYSTEM = `You are scaffolding a node:test-based grader.ts file for a Unity 6 ggdd guide.

The grader is a TypeScript file invoked as: \`node --experimental-strip-types --test grader.ts\`.

It must:
1. Import from '../../test-fixture.ts' — available helpers: readCSharp, hasPattern, hasNoPattern,
   usesNamespace, declaresType, methodCallsAst, serializedAssetField.
2. Compute TARGET from process.env.TARGET_FILE (fallback to path.join(import.meta.dirname, 'demo', '<file>.cs')).
3. Define tests using \`import { test } from 'node:test'\` + \`import assert from 'node:assert'\`.
4. Each test asserts a SPECIFIC pattern from the guide's expectations.md.

Output ONLY the TypeScript source. No markdown fences, no commentary. The grader should pass
against the demo file (all assertions true) and fail at least one assertion against the
negative-demo file.`;

export async function generateGrader(guideDir: string): Promise<void> {
  const guideMd = fs.readFileSync(path.join(guideDir, 'guide.md'), 'utf8');
  const expectations = fs.readFileSync(path.join(guideDir, 'expectations.md'), 'utf8');
  const demoDir = path.join(guideDir, 'demo');
  const demoFile = fs.readdirSync(demoDir).find(f => f.endsWith('.cs'))!;
  const demoSrc = fs.readFileSync(path.join(demoDir, demoFile), 'utf8');

  const user = `Guide:\n\n${guideMd}\n\nExpectations:\n\n${expectations}\n\nDemo (\`${demoFile}\`):\n\n\`\`\`csharp\n${demoSrc}\n\`\`\`\n\nWrite grader.ts.`;

  console.log(cBold(`gen-grader ${guideDir}`));
  const text = await complete({ system: SYSTEM, user });

  const outPath = path.join(guideDir, 'grader.ts');
  fs.writeFileSync(outPath, text.trim() + '\n');
  console.log(`${cGreen('✓')} wrote ${outPath} ${cDim(`(${text.length} chars)`)}`);
}
