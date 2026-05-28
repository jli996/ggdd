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
