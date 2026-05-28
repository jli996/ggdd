import { USE_CASES } from './use-cases.gen.ts';

export interface CatalogEntry {
  id: string;
  category: string;
  description: string;
}

export function listCatalog(): CatalogEntry[] {
  const seen = new Set<string>();
  const out: CatalogEntry[] = [];
  for (const uc of USE_CASES) {
    if (seen.has(uc.id)) continue;
    seen.add(uc.id);
    out.push({ id: uc.id, category: uc.category, description: uc.description });
  }
  return out;
}

export function findUseCaseById(id: string): CatalogEntry | undefined {
  return listCatalog().find(e => e.id === id);
}
