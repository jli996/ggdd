import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ClaudeCodeAgent } from './claude-code-agent.ts';
import { Serving } from '../config.ts';

test('prepareSkill drops a .claude/CLAUDE.md pointer in the workdir', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-'));
  try {
    await ClaudeCodeAgent.prepareSkill(dir, Serving.CLI);
    const p = path.join(dir, '.claude', 'CLAUDE.md');
    assert.ok(fs.existsSync(p));
    assert.match(fs.readFileSync(p, 'utf8'), /ggdd@latest search/);
  } finally {
    fs.rmSync(dir, { recursive: true });
  }
});
