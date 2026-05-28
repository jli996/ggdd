import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// lib/ is at <rootDir>/lib, so rootDir is one level up.
export const rootDir = path.resolve(__dirname, '..');

export const guidesDir = path.join(rootDir, 'guides');
export const servingDir = path.join(rootDir, 'serving');
export const baseAppsDir = path.join(rootDir, 'harness', 'base_apps');
export const evalViewDir = path.join(rootDir, 'eval-view');
export const featuresDir = path.join(rootDir, 'features');
export const harnessDir = path.join(rootDir, 'harness');
