import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { USE_CASES } from './use-cases.gen.ts';
import { expandIncludes } from './macros.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In source layout, the workspace root is one level above serving/.
// In published layout (bundled), guides aren't shipped — see §3.5 of the design.
// Plan 1 retrieves from source. Plan 6 will switch to a packaged-guides layout.
const SERVING_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(SERVING_DIR, '..');
const GUIDES_DIR = path.join(ROOT_DIR, 'guides');

export class RetrieveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetrieveError';
  }
}

export async function retrieveUseCase(id: string): Promise<string> {
  const known = USE_CASES.find(uc => uc.id === id);
  if (!known) throw new RetrieveError(`Unknown guide id: ${id}`);

  const guidePath = path.join(GUIDES_DIR, known.category, id, 'guide.md');
  if (!fs.existsSync(guidePath)) {
    throw new RetrieveError(`Guide file missing on disk: ${guidePath}`);
  }
  const raw = await fs.promises.readFile(guidePath, 'utf8');
  return expandIncludes(raw, guidePath);
}
