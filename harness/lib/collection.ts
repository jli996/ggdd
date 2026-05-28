import * as path from 'node:path';
import * as fs from 'node:fs';
import { collectGuides, type CatalogEntry } from '../../lib/catalog.ts';

export interface SuiteTask {
  guideId: string;
  guideDir: string;
  category: CatalogEntry['category'];
  baseApp: string;
  gradeMode: CatalogEntry['frontmatter']['gradeMode'];
  taskMd: string;
}

export function collectSuiteTasks(filter?: { ids?: string[]; categories?: string[] }): SuiteTask[] {
  const guides = collectGuides();
  return guides
    .filter(g => !filter?.ids || filter.ids.includes(g.id))
    .filter(g => !filter?.categories || filter.categories.includes(g.category))
    .map(g => ({
      guideId: g.id,
      guideDir: g.dir,
      category: g.category,
      baseApp: g.frontmatter.baseApp,
      gradeMode: g.frontmatter.gradeMode,
      taskMd: fs.readFileSync(path.join(g.dir, 'tasks', 'task.md'), 'utf8'),
    }));
}
