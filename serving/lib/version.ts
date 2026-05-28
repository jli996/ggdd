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
