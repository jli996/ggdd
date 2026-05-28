import type { AgentRunner } from '../lib/agent-shared.ts';
import { NotImplementedError } from '../lib/agent-shared.ts';

export const JetskiCliAgent: AgentRunner = {
  id: 'jetski-cli',
  defaultModel: 'jetski-default',
  async prepareSkill() { throw new NotImplementedError('jetski-cli'); },
  async run() { throw new NotImplementedError('jetski-cli'); },
};
