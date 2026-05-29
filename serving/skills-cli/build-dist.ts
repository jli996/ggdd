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

function copyDirRecursive(src: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFileIfExists(src: string, dst: string): boolean {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return true;
}

export async function buildDist(): Promise<void> {
  // Clean + recreate.
  if (fs.existsSync(BUILD)) fs.rmSync(BUILD, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });

  // Helper: bundle an entry point and ensure a clean #!/usr/bin/env node shebang.
  async function bundleWithShebang(entryPoint: string, outfile: string): Promise<void> {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true, format: 'esm', platform: 'node', target: 'node22',
      outfile,
      external: EXTERNAL,
      loader: { '.ts': 'ts' },
    });
    // Strip any existing shebang(s) from esbuild output, then add a clean one.
    let content = fs.readFileSync(outfile, 'utf8');
    content = content.replace(/^(#!.*\n)+/, '');
    content = '#!/usr/bin/env node\n' + content;
    fs.writeFileSync(outfile, content, 'utf8');
  }

  // Bundle the CLI + MCP server.
  await bundleWithShebang(path.join(SERVING, 'bin', 'ggdd.ts'), path.join(BUILD, 'ggdd.js'));
  await bundleWithShebang(path.join(SERVING, 'mcp-server', 'index.ts'), path.join(BUILD, 'mcp-server.js'));

  // Make built files executable.
  fs.chmodSync(path.join(BUILD, 'ggdd.js'), 0o755);
  fs.chmodSync(path.join(BUILD, 'mcp-server.js'), 0o755);

  // Copy vendored model + generated corpus next to the bundled files
  // (the bundle's __dirname-relative reads resolve here).
  copyDirRecursive(path.join(SERVING, 'lib', 'tfjs_model_minilm'), path.join(BUILD, 'tfjs_model_minilm'));
  copyFileIfExists(path.join(SERVING, 'lib', 'use-cases.gen.ts'), path.join(BUILD, 'use-cases.gen.ts'));
  copyFileIfExists(path.join(SERVING, 'lib', 'embeddings.gen.bin'), path.join(BUILD, 'embeddings.gen.bin'));
  copyFileIfExists(path.join(SERVING, 'lib', 'tag-index.gen.ts'), path.join(BUILD, 'tag-index.gen.ts'));
  copyFileIfExists(path.join(SERVING, 'lib', 'tag-embeddings.gen.bin'), path.join(BUILD, 'tag-embeddings.gen.bin'));

  // Copy megaskill + SKILL.md + plugin.json + skill-version.txt.
  copyFileIfExists(path.join(SERVING, 'megaskill', 'megaskill.md'), path.join(BUILD, 'megaskill.md'));
  copyFileIfExists(path.join(SERVING, 'skills-cli', 'template', 'SKILL.md'), path.join(BUILD, 'SKILL.md'));
  copyFileIfExists(path.join(SERVING, 'skills-cli', 'template', 'plugin.json'), path.join(BUILD, 'plugin.json'));
  copyFileIfExists(path.join(SERVING, 'skills-cli', 'template', 'skill-version.txt'), path.join(BUILD, 'skill-version.txt'));
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  await buildDist();
  console.log(`Built to ${BUILD}`);
}
