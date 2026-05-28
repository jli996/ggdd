import * as fs from 'node:fs';
import * as path from 'node:path';

export function resolveInclude(includeArg: string, fromFile: string): string {
  const absPath = path.resolve(path.dirname(fromFile), includeArg);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Include not found: ${includeArg} (resolved to ${absPath}, from ${fromFile})`);
  }
  return fs.readFileSync(absPath, 'utf8');
}
