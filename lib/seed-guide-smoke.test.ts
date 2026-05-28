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
