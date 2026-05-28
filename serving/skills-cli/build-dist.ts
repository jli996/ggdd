import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVING = path.resolve(__dirname, '..');
const BUILD = path.join(SERVING, 'build');

const EXTERNAL = [
  '@tensorflow/tfjs-core',
  '@tensorflow/tfjs-converter',
  '@tensorflow/tfjs-backend-cpu',
  '@huggingface/transformers',
  '@modelcontextprotocol/sdk',
  'gray-matter',
  'zod',
  'onnxruntime-node',
];

export async function buildDist(): Promise<void> {
  await fs.promises.mkdir(BUILD, { recursive: true });

  // Helper to add shebang and make executable
  async function buildAndAddShebang(
    entryPoint: string,
    outfile: string,
  ): Promise<void> {
    const tempFile = outfile + '.tmp';

    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node22',
      outfile: tempFile,
      external: EXTERNAL,
      loader: { '.ts': 'ts' },
    });

    // Read the generated file, remove any existing shebang, add the correct one
    let content = await fs.promises.readFile(tempFile, 'utf8');

    // Remove any existing shebang lines
    content = content.replace(/^#!.*\n/, '');

    // Add the correct shebang
    content = '#!/usr/bin/env node\n' + content;

    // Write final file
    await fs.promises.writeFile(outfile, content, 'utf8');

    // Clean up temp file
    await fs.promises.unlink(tempFile);
  }

  await buildAndAddShebang(
    path.join(SERVING, 'bin', 'ggdd.ts'),
    path.join(BUILD, 'ggdd.js'),
  );

  await buildAndAddShebang(
    path.join(SERVING, 'mcp-server', 'index.ts'),
    path.join(BUILD, 'mcp-server.js'),
  );

  // Make built files executable.
  await fs.promises.chmod(path.join(BUILD, 'ggdd.js'), 0o755);
  await fs.promises.chmod(path.join(BUILD, 'mcp-server.js'), 0o755);
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  await buildDist();
  console.log(`Built to ${BUILD}`);
}
