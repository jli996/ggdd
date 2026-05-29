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
    `---\nid: g1\ncategory: unity-engine\ntitle: G1\ndescription: D\nuseCases:\n  - "u"\ngradeMode: static\nunityVersion: "6000.0"\nbaseApp: empty-unity6\ntags:\n  - unity-engine\n  - modern-api\n  - performance\n---\n\nG1 body content.\n`);

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
