import { test } from 'node:test';
import assert from 'node:assert';
import { retrieveUseCase, RetrieveError } from './retrieve.ts';

test('retrieveUseCase returns the guide markdown for a known id', async () => {
  const md = await retrieveUseCase('new-input-system-basics');
  assert.match(md, /New Input System basics/);
  assert.match(md, /UnityEngine\.InputSystem/);
});

test('retrieveUseCase throws RetrieveError for an unknown id', async () => {
  await assert.rejects(
    () => retrieveUseCase('does-not-exist'),
    (err: unknown) => err instanceof RetrieveError,
  );
});
