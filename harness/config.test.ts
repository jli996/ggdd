import { test } from 'node:test';
import assert from 'node:assert';
import { Serving, resolveSuiteConfig } from './config.ts';

test('Serving enum exposes CLI, MCP, SKILLS_CLI', () => {
  assert.equal(Serving.CLI, 'cli');
  assert.equal(Serving.MCP, 'mcp');
  assert.equal(Serving.SKILLS_CLI, 'skills-cli');
});

test('resolveSuiteConfig returns defaults with no arguments', async () => {
  const c = await resolveSuiteConfig();
  assert.equal(c.serving, Serving.CLI);
  assert.ok(Array.isArray(c.agents));
  assert.ok(c.agents.includes('claude-code'));
  assert.equal(c.concurrency, 4);
  assert.equal(c.unitySlotCount, 2);
});

test('resolveSuiteConfig honors env overrides', async () => {
  process.env.UNITY_EDITOR_PATH = '/some/path/Unity';
  const c = await resolveSuiteConfig();
  assert.equal(c.unityEditorPath, '/some/path/Unity');
  delete process.env.UNITY_EDITOR_PATH;
});
