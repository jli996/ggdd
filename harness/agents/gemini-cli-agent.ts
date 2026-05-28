import type { AgentRunner } from '../lib/agent-shared.ts';
import { NotImplementedError } from '../lib/agent-shared.ts';

export const GeminiCliAgent: AgentRunner = {
  id: 'gemini-cli',
  defaultModel: 'gemini-2.0-flash',
  async prepareSkill() { throw new NotImplementedError('gemini-cli'); },
  async run() { throw new NotImplementedError('gemini-cli'); },
};
