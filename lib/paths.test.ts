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
