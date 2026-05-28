import { resolveSuiteConfig } from './config.ts';
import { runSuite } from './run_suite.ts';

export async function evaluate(opts: { configPath?: string; tasks?: string[] } = {}): Promise<void> {
  const suiteConfig = await resolveSuiteConfig({ configPath: opts.configPath });
  await runSuite({ suiteConfig, tasks: opts.tasks });
}
