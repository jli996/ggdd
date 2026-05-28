import * as fs from 'node:fs';
import * as path from 'node:path';
import { complete } from './anthropic-client.ts';
import { cBold, cDim, cGreen } from '../lib/colors.ts';

const SYSTEM = `You are scaffolding a "negative demo" C# file for a Unity 6 ggdd guide.
A negative demo deliberately VIOLATES the patterns the guide teaches — it represents what an
agent might write before applying the guide. The grader uses this to verify calibration.

Output ONLY the C# source. No markdown fences, no commentary. Use the exact same class name
and method signatures as the demo, but with the anti-pattern inverted (legacy APIs, missing
caching, missing guards, etc.).`;

export async function generateNegative(guideDir: string): Promise<void> {
  const guideMd = fs.readFileSync(path.join(guideDir, 'guide.md'), 'utf8');
  const demoDir = path.join(guideDir, 'demo');
  if (!fs.existsSync(demoDir)) throw new Error(`No demo/ at ${guideDir}`);
  const demoFile = fs.readdirSync(demoDir).find(f => f.endsWith('.cs'));
  if (!demoFile) throw new Error(`No .cs file under ${demoDir}`);
  const demoSrc = fs.readFileSync(path.join(demoDir, demoFile), 'utf8');

  const user = `Guide:\n\n${guideMd}\n\n---\n\nReference (correct) demo file \`${demoFile}\`:\n\n\`\`\`csharp\n${demoSrc}\n\`\`\`\n\nProduce the matching negative-demo (anti-pattern) C# source.`;

  console.log(cBold(`gen-negative ${guideDir}`));
  const text = await complete({ system: SYSTEM, user });

  const outDir = path.join(guideDir, 'negative-demo');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, demoFile);
  fs.writeFileSync(outPath, text.trim() + '\n');
  console.log(`${cGreen('✓')} wrote ${outPath} ${cDim(`(${text.length} chars)`)}`);
}
