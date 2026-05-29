import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGuide, validateFrontmatter } from '../../lib/guide-validation.ts';
import { TfjsEmbedder } from '../lib/tfjs-embedder.ts';
import { type UseCaseEntry, readEmbeddingsBlob, writeEmbeddingsBlob } from '../lib/corpus-io.ts';

export type { UseCaseEntry };
export { readEmbeddingsBlob, writeEmbeddingsBlob };

export interface BuildResult {
  numUseCases: number;
  vectorDim: number;
  guides: number;
  numTags: number;
}

export interface BuildOptions {
  guidesDir: string;
  outDir: string;
}

/**
 * Canonical game examples per tag — embedded into the tag's vector so brand-name
 * queries ("league of legends", "candy crush", "dark souls") resolve to the
 * correct subgenre tag. Only listed for genre / subgenre / unity tags;
 * cross-cutting mechanical tags (economy, tier-progression, pacing, …) don't
 * benefit because they're abstract concepts, not games.
 */
const TAG_EXAMPLES: Record<string, string[]> = {
  // Genre umbrellas
  shooter: ['Call of Duty', 'Counter-Strike', 'Valorant', 'Apex Legends', 'Battlefield', 'Halo', 'FPS', 'first-person shooter'],
  platformer: ['Mario', 'Sonic', 'Celeste', 'Hollow Knight', 'Super Meat Boy'],
  strategy: ['StarCraft', 'Age of Empires', 'Civilization', 'Total War', 'turn based strategy', 'real time strategy'],
  puzzle: ['Tetris', 'Portal', 'Bejeweled', 'Candy Crush', 'Sudoku', 'puzzle game'],
  casual: ['mobile game', 'short session', 'free to play'],
  action: ['God of War', 'Devil May Cry', 'Bayonetta', 'character action'],

  // Shooter subgenres
  'survival-shooter': ['DayZ', 'Rust', 'ARK', 'Conan Exiles', 'survival shooter'],
  'extraction-shooter': ['Escape from Tarkov', 'Hunt Showdown', 'The Cycle', 'extraction shooter'],
  'competitive-shooter': ['Counter-Strike', 'Valorant', 'Overwatch', 'Rainbow Six Siege', 'esports shooter'],
  'singleplayer-shooter': ['DOOM', 'Half-Life', 'Titanfall', 'BioShock', 'narrative FPS'],

  // Platformer subgenres
  'precision-platformer': ['Celeste', 'Super Meat Boy', 'The End is Nigh'],
  'momentum-platformer': ['Sonic', 'Hollow Knight'],
  '3d-collectathon': ['Mario 64', 'Banjo Kazooie', 'Super Mario Odyssey'],

  // Action subgenres
  'action-design': ['God of War', 'Devil May Cry', 'Bayonetta', 'character action game'],
  soulslike: ['Dark Souls', 'Elden Ring', 'Sekiro', 'Bloodborne'],

  // Strategy subgenres
  'rts-classic': ['StarCraft', 'Age of Empires', 'Warcraft III', 'Command and Conquer'],
  moba: ['League of Legends', 'Dota 2', 'Smite', 'Heroes of the Storm', 'multiplayer online battle arena'],
  mmorts: ['Travian', 'Tribal Wars', 'Forge of Empires', 'Lords Mobile', 'massively multiplayer strategy'],

  // Casual puzzle
  'match-3': ['Candy Crush', 'Bejeweled', 'Royal Match', 'Homescapes', 'tile matching'],
  'merge-2': ['Merge Mansion', 'Travel Town', 'Merge Dragons', 'tile merging'],
  'color-sort': ['Water Sort', 'Ball Sort', 'Liquid Sort', 'sorting puzzle'],

  // Casual action / economy
  'lane-switch': ['Crowd City', 'Run Race 3D', 'Stickman Boost', 'crowd runner'],
  'clicker-idle': ['Cookie Clicker', 'AdVenture Capitalist', 'NGU Idle', 'idle game', 'incremental game'],
  'hyper-casual': ['Crossy Road', 'Helix Jump', 'Aquapark', 'Stack', 'snackable game'],
  'endless-runner': ['Temple Run', 'Subway Surfers', 'auto runner'],

  // Other subgenres
  deckbuilder: ['Slay the Spire', 'Monster Train', 'Inscryption', 'card game roguelite'],
  'ai-perception': ['stealth game enemy AI', 'horror creature AI', 'NPC vision and hearing'],

  // Unity
  'unity-engine': ['Unity Editor API', 'Unity package'],
  'unity-performance': ['Unity profiling', 'Unity optimization', 'frame rate'],

  // Genre-orthogonal context (light annotations)
  'mobile-first': ['mobile game', 'iOS Android'],
  'roguelike-run': ['roguelite', 'Slay the Spire', 'Hades', 'permadeath'],
};

export async function buildGuides(opts: BuildOptions): Promise<BuildResult> {
  const guidePaths = collectGuidePaths(opts.guidesDir);
  const embedder = new TfjsEmbedder();

  // First pass: parse + validate guides; collect tags.
  const parsedGuides: Array<{ fm: ReturnType<typeof validateFrontmatter>; useCases: string[]; description: string; tags: string[] }> = [];
  const allTags = new Set<string>();
  for (const guidePath of guidePaths) {
    const src = await fs.promises.readFile(guidePath, 'utf8');
    const { frontmatter } = parseGuide(src);
    const fm = validateFrontmatter(frontmatter);
    parsedGuides.push({ fm, useCases: fm.useCases, description: fm.description, tags: fm.tags });
    for (const t of fm.tags) allTags.add(t);
  }

  // Build tag index + embeddings.
  const sortedTags = Array.from(allTags).sort();
  const tagIndex: Record<string, number> = {};
  sortedTags.forEach((t, i) => { tagIndex[t] = i; });
  const tagVectors: Float32Array[] = [];
  for (const tag of sortedTags) {
    // Embed the tag NAME + canonical game examples (for subgenre/genre tags).
    // Brand-name queries ("league of legends", "candy crush") need the model to
    // see those tokens in the tag's embedding to resolve correctly.
    const tagText = tag.replace(/-/g, ' ');
    const examples = TAG_EXAMPLES[tag] ?? [];
    const enrichedText = examples.length > 0 ? `${tagText} ${examples.join(' ')}` : tagText;
    tagVectors.push(await embedder.embed(enrichedText));
  }

  // Second pass: build use-case entries with tagIndices resolved.
  const entries: UseCaseEntry[] = [];
  const useCaseVectors: Float32Array[] = [];
  for (const g of parsedGuides) {
    const tagIndices = g.tags.map(t => tagIndex[t]).filter((i): i is number => i !== undefined);

    // Build a per-guide enrichment string from canonical example titles of its
    // tags. Inject these tokens into the use-case embedding so brand-name
    // queries ("League of Legends", "Slay the Spire") resolve to guides whose
    // tags correspond to those brands, without relying solely on the user
    // writing use-case strings that mention the brands.
    const enrichmentTokens = new Set<string>();
    for (const tag of g.tags) {
      const examples = TAG_EXAMPLES[tag];
      if (examples) for (const ex of examples) enrichmentTokens.add(ex);
    }
    const enrichment = enrichmentTokens.size > 0
      ? ` Related examples: ${Array.from(enrichmentTokens).join(', ')}.`
      : '';

    for (const useCase of g.useCases) {
      const idx = entries.length;
      entries.push({
        id: g.fm.id,
        category: g.fm.category,
        description: g.description,
        useCase,
        embeddingIndex: idx,
        tagIndices,
      });
      useCaseVectors.push(await embedder.embed(`${useCase}. ${g.description}${enrichment}`));
    }
  }

  const vectorDim = useCaseVectors[0]?.length ?? 384;

  await fs.promises.mkdir(opts.outDir, { recursive: true });
  await writeUseCases(path.join(opts.outDir, 'use-cases.gen.ts'), entries);
  await writeEmbeddingsBlob(path.join(opts.outDir, 'embeddings.gen.bin'), useCaseVectors, vectorDim);

  // Write tag artifacts.
  await writeTagIndex(path.join(opts.outDir, 'tag-index.gen.ts'), tagIndex);
  await writeEmbeddingsBlob(path.join(opts.outDir, 'tag-embeddings.gen.bin'), tagVectors, vectorDim);

  return { numUseCases: entries.length, vectorDim, guides: guidePaths.length, numTags: sortedTags.length };
}

function collectGuidePaths(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  function walk(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name === 'guide.md') out.push(full);
    }
  }
  walk(dir);
  return out.sort();
}

async function writeUseCases(outPath: string, entries: UseCaseEntry[]): Promise<void> {
  const header = `// AUTO-GENERATED by serving/scripts/build-guides.ts. Do not edit by hand.\n` +
                 `import type { UseCaseEntry } from '../lib/corpus-io.ts';\n\n` +
                 `export const USE_CASES: ReadonlyArray<UseCaseEntry> = [\n`;
  const body = entries.map(e =>
    `  { id: ${JSON.stringify(e.id)}, ` +
    `category: ${JSON.stringify(e.category)}, ` +
    `description: ${JSON.stringify(e.description)}, ` +
    `useCase: ${JSON.stringify(e.useCase)}, ` +
    `embeddingIndex: ${e.embeddingIndex}, ` +
    `tagIndices: [${e.tagIndices.join(', ')}] },`,
  ).join('\n');
  const footer = `\n];\n`;
  await fs.promises.writeFile(outPath, header + body + footer);
}

async function writeTagIndex(outPath: string, tagIndex: Record<string, number>): Promise<void> {
  const lines = Object.keys(tagIndex).sort().map(t => `  ${JSON.stringify(t)}: ${tagIndex[t]},`);
  const content = `// AUTO-GENERATED by serving/scripts/build-guides.ts.\n\n` +
                  `export const TAG_INDEX: Readonly<Record<string, number>> = {\n` +
                  `${lines.join('\n')}\n` +
                  `};\n\n` +
                  `export const TAGS: ReadonlyArray<string> = Object.keys(TAG_INDEX);\n`;
  await fs.promises.writeFile(outPath, content);
}

// CLI entry: when invoked directly, build from the workspace's guides/ into serving/lib/.
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const servingDir = path.resolve(path.dirname(__filename), '..');
  const rootDir = path.resolve(servingDir, '..');
  const guidesDir = path.join(rootDir, 'guides');
  const outDir = path.join(servingDir, 'lib');
  const result = await buildGuides({ guidesDir, outDir });
  console.log(`Built ${result.numUseCases} use cases from ${result.guides} guide(s) into ${outDir}, ${result.numTags} tags`);
}
