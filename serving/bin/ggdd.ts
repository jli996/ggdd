#!/usr/bin/env -S node --experimental-strip-types

import { parseArgs } from 'node:util';
import { ClearcutLogger } from '../skills-cli/telemetry/ClearcutLogger.ts';
import { CommandType } from '../skills-cli/telemetry/types.ts';
import { getVersion } from '../lib/version.ts';
import { retrieveUseCase, RetrieveError } from '../lib/retrieve.ts';
import { listCatalog } from '../lib/practices.ts';

function printUsage() {
  console.log(`
Usage: ggdd <command> [args]

Commands:
  search <query>            Search use cases by query
  list                      List all available use cases
  retrieve <ids>            Retrieve use case(s) by ID(s), comma-separated
  install [--choose]        Install the ggdd skill
  uninstall                 Uninstall the ggdd skill
  update                    Update installed ggdd skills

Options:
  --skill-version <version> Internal: version of the skill being executed
  --choose                  Choose specific skills interactively
  -h, --help                Show this help
  -v, --version             Show version
`);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      choose: { type: 'boolean' },
      'skill-version': { type: 'string' },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.version) {
    console.log(getVersion(import.meta.dirname));
    process.exit(0);
  }

  if (values.help || positionals.length === 0) {
    printUsage();
    process.exit(values.help ? 0 : 1);
  }

  const skillVersion = typeof values['skill-version'] === 'string' ? values['skill-version'] : null;
  let loggerInstance: ClearcutLogger | undefined;
  const getLogger = () => loggerInstance ??= new ClearcutLogger({ skillVersion });

  const command = positionals[0];
  const arg = positionals.slice(1).join(' ');

  if (command === 'search') {
    if (!arg) {
      await getLogger().logSearchResult(0, false, []);
      console.error('No search query provided.');
      process.exit(1);
    }
    const startTime = Date.now();
    try {
      const { searchUseCases } = await import('../lib/search.ts');
      const results = await searchUseCases(arg);
      const latencyMs = Date.now() - startTime;
      await getLogger().logSearchResult(
        latencyMs,
        true,
        results.map(r => ({ guide_id: r.id, similarity: Number(r.similarity) })),
      );
      if (results.length === 0) {
        console.log('[]');
      } else {
        const lines = results.map(r => JSON.stringify(r));
        console.log('[' + lines.join(',\n') + ']');
      }
    } catch (error) {
      await getLogger().logSearchResult(Date.now() - startTime, false, []);
      console.error('Search failed:', error);
      process.exit(1);
    }
  } else if (command === 'list') {
    const catalog = listCatalog();
    console.log(JSON.stringify(catalog, null, 2));
  } else if (command === 'retrieve') {
    const ids = arg ? arg.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (ids.length === 0) {
      await getLogger().logRetrieveResult(0, false, '');
      console.error('No IDs provided for retrieve.');
      process.exit(1);
    }
    let hasError = false;
    for (const id of ids) {
      const startTime = Date.now();
      try {
        const guide = await retrieveUseCase(id);
        console.log(`\n--- Guide for ${id} ---`);
        console.log(guide);
        await getLogger().logRetrieveResult(Date.now() - startTime, true, id);
      } catch (error) {
        hasError = true;
        if (error instanceof RetrieveError) console.error(`Retrieve failed for ${id}: ${error.message}`);
        else console.error(`Retrieve failed for ${id}:`, error);
        await getLogger().logRetrieveResult(Date.now() - startTime, false, id);
      }
    }
    if (hasError) process.exit(1);
  } else {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
