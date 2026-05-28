#!/usr/bin/env -S node --experimental-strip-types

import { parseArgs } from 'node:util';

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
    const { getVersion } = await import('../lib/version.ts');
    console.log(getVersion(import.meta.dirname));
    process.exit(0);
  }

  if (values.help || positionals.length === 0) {
    printUsage();
    process.exit(values.help ? 0 : 1);
  }

  console.error(`Unknown command: ${positionals[0]}`);
  printUsage();
  process.exit(1);
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
