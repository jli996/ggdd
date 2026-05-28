import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseGuide, validateFrontmatter, type GuideFrontmatter } from './guide-validation.ts';
import { guidesDir } from './paths.ts';

export interface CatalogEntry {
  id: string;
  category: GuideFrontmatter['category'];
  guidePath: string;
  dir: string;
  frontmatter: GuideFrontmatter;
}

export function collectGuides(rootDir: string = guidesDir): CatalogEntry[] {
  const out: CatalogEntry[] = [];
  function walk(d: string) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name === 'guide.md') {
        const fm = validateFrontmatter(parseGuide(fs.readFileSync(full, 'utf8')).frontmatter);
        out.push({ id: fm.id, category: fm.category, guidePath: full, dir: path.dirname(full), frontmatter: fm });
      }
    }
  }
  walk(rootDir);
  return out.sort((a, b) => a.id.localeCompare(b.id));
}
