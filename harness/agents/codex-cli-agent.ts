import type { AgentRunner } from '../lib/agent-shared.ts';
import { NotImplementedError } from '../lib/agent-shared.ts';

export const CodexCliAgent: AgentRunner = {
  id: 'codex-cli',
  defaultModel: 'gpt-5-codex',
  async prepareSkill() { throw new NotImplementedError('codex-cli'); },
  async run() { throw new NotImplementedError('codex-cli'); },
};
