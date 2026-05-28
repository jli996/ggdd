import { test } from 'node:test';
import assert from 'node:assert';
import { complete, MissingAnthropicKeyError } from './anthropic-client.ts';

test('complete in dryRun mode returns the request payload (no API call)', async () => {
  const out = await complete({ system: 's', user: 'u' }, { dryRun: true });
  const payload = JSON.parse(out);
  assert.equal(payload.model, 'claude-sonnet-4-6');
  assert.equal(payload.messages[0].content, 'u');
  assert.equal(payload.system[0].text, 's');
  assert.equal(payload.system[0].cache_control.type, 'ephemeral');
});

test('complete throws MissingAnthropicKeyError when key is missing', async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    await assert.rejects(() => complete({ system: 's', user: 'u' }), MissingAnthropicKeyError);
  } finally {
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});
