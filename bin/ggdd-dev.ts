#!/usr/bin/env -S node --experimental-strip-types

import { parseArgs } from 'node:util';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cBold, cCyan, cDim, cGreen, cRed } from '../lib/colors.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env (Node 20+).
try { (process as any).loadEnvFile?.(path.join(ROOT, '.env')); } catch { /* ok if missing */ }

const COMMANDS = {
  audit: 'Show status of all guides',
  dev: 'Run author loop for a single guide (or all with dev-all)',
  'dev-all': 'Run dev pipeline across every guide',
  'gen-grader': 'Generate grader.ts via Anthropic (requires ANTHROPIC_API_KEY)',
  'gen-negative': 'Generate negative-demo via Anthropic (requires ANTHROPIC_API_KEY)',
  'test-grader': 'Validate calibration: grader must pass demo, fail negative-demo',
  grade: 'Run a guide grader against its demo (or TARGET_FILE)',
  'warm-cache': 'Pre-populate Unity Library cache for a base-app',
  eval: 'Run the evaluation suite (or specific guide ids via --tasks)',
  run: 'Run an ad-hoc agent test against a base-app (--template <baseApp> --prompt "...")',
  backfill: 'Recompute metrics for historical run artifacts',
  upload: 'Upload results to GCS (requires GGDD_GCS_BUCKET)',
  dashboard: '[Plan 5] Start the eval-view dashboard locally',
  deploy: '[Plan 5] Publish eval-view to GitHub Pages',
  apiref: '[Placeholder] Unity API/version compat lookup',
  'setup-completion': 'Install shell auto-completion',
} as const;

type CommandName = keyof typeof COMMANDS;

function printUsage() {
  console.log(`\n${cCyan('Usage:')} ggdd-dev <command> [options]\n`);
  console.log(cBold('Commands:'));
  for (const [name, desc] of Object.entries(COMMANDS)) {
    console.log(`  ${cCyan(name.padEnd(20))} ${desc}`);
  }
  console.log(`\n${cBold('Common flags:')}`);
  console.log(`  ${cDim('--guide <dir>')}        Path to a guide directory (e.g. guides/unity-engine/new-input-system-basics)`);
  console.log(`  ${cDim('--verbose')}             Show additional output`);
  console.log(`  ${cDim('-h, --help')}           Show this help`);
  console.log(`  ${cDim('-v, --version')}        Show version\n`);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      verbose: { type: 'boolean' },
      guide: { type: 'string' },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.version) {
    const fs = await import('node:fs');
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    console.log(pkg.version || '0.0.0');
    process.exit(0);
  }

  const cmd = positionals[0] as CommandName | undefined;
  if (!cmd || values.help) { printUsage(); process.exit(values.help ? 0 : 1); }

  const opts = { verbose: !!values.verbose, guide: (values.guide as string | undefined) ?? positionals[1] };

  switch (cmd) {
    case 'audit': {
      const { auditGuides } = await import('../guides/dev-guide.ts');
      const ok = await auditGuides({ verbose: opts.verbose });
      process.exit(ok ? 0 : 1);
    }
    case 'dev': {
      if (!opts.guide) { console.error(cRed('ggdd-dev dev requires --guide <dir>')); process.exit(1); }
      const { devGuide } = await import('../guides/dev-guide.ts');
      const ok = await devGuide(opts.guide, { verbose: opts.verbose });
      process.exit(ok ? 0 : 1);
    }
    case 'dev-all': {
      const { devAll } = await import('../guides/dev-guide.ts');
      const ok = await devAll({ verbose: opts.verbose, testGraderOnly: process.argv.includes('--test-grader') });
      process.exit(ok ? 0 : 1);
    }
    case 'test-grader': {
      if (!opts.guide) { console.error(cRed('ggdd-dev test-grader requires --guide <dir>')); process.exit(1); }
      const { testGrader } = await import('../guides/test-grader.ts');
      const ok = await testGrader(opts.guide, { verbose: opts.verbose });
      process.exit(ok ? 0 : 1);
    }
    case 'grade': {
      if (!opts.guide) { console.error(cRed('ggdd-dev grade requires --guide <dir>')); process.exit(1); }
      const { runGrader } = await import('../guides/run-grader.ts');
      const res = await runGrader(opts.guide, { target: process.env.TARGET_FILE });
      console.log(`${res.pass} pass, ${res.fail} fail`);
      process.exit(res.fail === 0 ? 0 : 1);
    }
    case 'gen-grader': {
      if (!opts.guide) { console.error(cRed('ggdd-dev gen-grader requires --guide <dir>')); process.exit(1); }
      const { generateGrader } = await import('../guides/grader-gen.ts');
      await generateGrader(opts.guide);
      break;
    }
    case 'gen-negative': {
      if (!opts.guide) { console.error(cRed('ggdd-dev gen-negative requires --guide <dir>')); process.exit(1); }
      const { generateNegative } = await import('../guides/negative-gen.ts');
      await generateNegative(opts.guide);
      break;
    }
    case 'eval': {
      const tasksFlag = (values as any).tasks as string | undefined;
      const tasks = tasksFlag ? tasksFlag.split(',').map(s => s.trim()).filter(Boolean)
                              : positionals.slice(1).filter(p => p !== 'suite');
      const { evaluate } = await import('../harness/evaluate.ts');
      await evaluate({ configPath: (values as any).config, tasks });
      break;
    }
    case 'run': {
      const tmpl = positionals[1];
      const prompt = positionals.slice(2).join(' ');
      if (!tmpl || !prompt) { console.error(cRed('ggdd-dev run <baseApp> "<prompt>"')); process.exit(1); }
      const { runSuite } = await import('../harness/run_suite.ts');
      const { resolveSuiteConfig } = await import('../harness/config.ts');
      const suiteConfig = await resolveSuiteConfig({ configPath: (values as any).config });
      // Synthesize a one-off task: pick the first guide for that base-app.
      const { collectSuiteTasks } = await import('../harness/lib/collection.ts');
      const all = collectSuiteTasks();
      const t = all.find(x => x.baseApp === tmpl);
      if (!t) { console.error(cRed(`No guide uses baseApp=${tmpl}`)); process.exit(1); }
      const synthetic = { ...t, taskMd: prompt };
      // ad-hoc: replace tasks at suite level
      (global as any).__GGDD_ADHOC_TASK = synthetic;
      await runSuite({ suiteConfig, tasks: [t.guideId] });
      break;
    }
    case 'warm-cache': {
      const baseApp = opts.guide ?? positionals[1];
      if (!baseApp) { console.error(cRed('ggdd-dev warm-cache <baseApp>')); process.exit(1); }
      const { unityCompile, resolveUnityEditor } = await import('../harness/lib/unity-runner.ts');
      const editor = resolveUnityEditor();
      if (!editor) {
        console.error(cRed('Unity 6 Editor not found. Set UNITY_EDITOR_PATH or install via Unity Hub.'));
        process.exit(1);
      }
      const baseSrc = path.join(ROOT, 'harness', 'base_apps', baseApp);
      const fs = await import('node:fs');
      if (!fs.existsSync(baseSrc)) { console.error(cRed(`Base app missing: ${baseSrc}`)); process.exit(1); }
      console.log(cBold(`warm-cache ${baseApp} (first-time imports may take 60-90s)…`));
      const r = await unityCompile(baseSrc, { verbose: !!values.verbose, timeoutMs: 600_000 });
      console.log(r.ok ? `${cGreen('✓')} warmed` : `${cRed('✗')} compile errors:\n${r.errors.map(e => `  ${e.message}`).join('\n')}`);
      process.exit(r.ok ? 0 : 1);
    }
    case 'backfill': {
      const { backfill } = await import('../harness/backfill.ts');
      await backfill();
      break;
    }
    case 'upload': {
      const { uploadSuite } = await import('../harness/upload_suite.ts');
      await uploadSuite();
      break;
    }
    case 'dashboard': {
      const { spawn } = await import('node:child_process');
      const ev = path.join(ROOT, 'eval-view');
      console.log(cBold(`Starting eval-view dev server (${ev})…`));
      const child = spawn('npm', ['start'], { cwd: ev, stdio: 'inherit' });
      child.on('close', code => process.exit(code ?? 0));
      break;
    }
    case 'deploy': {
      const { spawn } = await import('node:child_process');
      const ev = path.join(ROOT, 'eval-view');
      console.log(cBold(`Building + deploying eval-view to GitHub Pages (${ev})…`));
      const child = spawn('npm', ['run', 'deploy-pages'], { cwd: ev, stdio: 'inherit' });
      child.on('close', code => process.exit(code ?? 0));
      break;
    }
    case 'apiref':
      console.log(cDim(`[${cmd}] is a placeholder for Plan 4+. Unity 6 only / no-op in Plan 3.`));
      process.exit(0);
    case 'setup-completion': {
      const omelette = (await import('omelette')).default;
      const c = omelette('ggdd-dev <command>');
      c.setupShellInitFile();
      console.log('Shell completion installed; restart your terminal.');
      process.exit(0);
    }
    default:
      console.error(cRed(`Unknown command: ${cmd}`));
      printUsage();
      process.exit(1);
  }
}

main().catch(err => { console.error(cRed('Execution failed:'), err); process.exit(1); });
