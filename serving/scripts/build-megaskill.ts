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
