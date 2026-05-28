import { test } from 'node:test';
import assert from 'node:assert';
import { ClearcutLogger } from './ClearcutLogger.ts';
import { CommandType } from './types.ts';

test('logger constructed with no endpoint env var does not throw', () => {
  delete process.env.GGDD_TELEMETRY_ENDPOINT;
  const logger = new ClearcutLogger({ skillVersion: null });
  assert.ok(logger);
});

test('logSearchResult returns a promise that resolves without doing anything observable', async () => {
  const logger = new ClearcutLogger({ skillVersion: null });
  const result = await logger.logSearchResult(100, true, []);
  assert.equal(result, undefined);
});

test('logRetrieveResult returns a promise that resolves', async () => {
  const logger = new ClearcutLogger({ skillVersion: null });
  await logger.logRetrieveResult(50, true, 'demo-id');
});

test('logToolCommand returns a promise that resolves', async () => {
  const logger = new ClearcutLogger({ skillVersion: null });
  await logger.logToolCommand(100, true, CommandType.INSTALL);
});
